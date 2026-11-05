/* eslint-disable promise/catch-or-return, promise/always-return, promise/no-nesting */

// #region import

const { config, logger, useTransaction } = require('@coko/server')

const {
  Config,
  EmailTemplate,
  Manuscript,
  Task,
  TaskAlert,
  TaskEmailNotification,
  TaskEmailNotificationLog,
  Team,
  User,
} = require('../models')

const { sendEmailWithPreparedData } = require('./user.controllers')

// #endregion import

/** For all tasks that have gone overdue during the previous calendar day, create alerts as appropriate.
 * Don't look further than yesterday, to avoid regenerating alerts that have already been seen. */
const createNewTaskAlerts = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const startOfToday = Temporal.Now.zonedDateTimeISO(
    activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC',
  ).startOfDay()

  const startOfYesterday = startOfToday.subtract({ days: 1 })

  // Don't look earlier than yesterday, so we don't recreate alerts that are already dismissed.
  const overdueTasks = await Task.findInProgressDueBetween(
    groupId,
    new Date(startOfYesterday.epochMilliseconds),
    new Date(startOfToday.epochMilliseconds),
  )

  const manuscriptIds = [...new Set(overdueTasks.map(t => t.manuscriptId))]
  const manuscriptMap = {}
  await Promise.all(
    manuscriptIds.map(async manuscriptId => {
      const isActive = await Manuscript.isActive(manuscriptId)

      const editorIds = isActive
        ? await Manuscript.getEditorIds(manuscriptId)
        : []

      manuscriptMap[manuscriptId] = { editorIds, shouldSkip: !editorIds }
    }),
  )

  const alertsToInsert = []

  overdueTasks.forEach(task => {
    const manuscriptDetails = manuscriptMap[task.manuscriptId]
    if (manuscriptDetails.shouldSkip) return // I.e., continue

    /* TODO Re-enable once we start creating alerts for assignees
    if (task.assigneeUserId)
      alertsToInsert.push({ taskId: task.id, userId: task.assigneeUserId }) */
    manuscriptDetails.editorIds.forEach(editorId => {
      alertsToInsert.push({ taskId: task.id, userId: editorId })
    })
  })

  if (alertsToInsert.length > 0)
    await TaskAlert.insertIgnoringDuplicates(alertsToInsert)
}

const createTaskEmailNotificationLog = async taskEmailNotificationLog => {
  await TaskEmailNotificationLog.insert(taskEmailNotificationLog)

  const associatedTask = await Task.findById(taskEmailNotificationLog.taskId, {
    related:
      '[assignee, emailNotifications.recipientUser, notificationLogs(orderByCreatedDesc)]',
    throwIfNotFound: false,
  })

  return associatedTask
}

const deleteAlertsForManuscript = async (manuscriptId, options = {}) => {
  const { trx } = options

  await TaskAlert.deleteByManuscriptId(manuscriptId, { trx })
}

const deleteTaskNotification = async id => {
  const taskEmailNotification = await TaskEmailNotification.findById(id)

  const { taskId } = taskEmailNotification

  await TaskEmailNotification.deleteById(id)

  const associatedTask = await Task.findById(taskId, {
    related:
      '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc)]',
    throwIfNotFound: false,
  })

  return associatedTask
}

const getTasks = async (manuscriptId, groupId) => {
  return (
    await Task.find({ manuscriptId, groupId }, { orderBy: ['sequenceIndex'] })
  ).result
}

const getTeamRecipients = async (emailNotification, roles, options = {}) => {
  const { trx } = options

  // task notifications through scheduler are supposed to be sent only to team members from latest version of manuscript
  const latestManuscriptVersionId = await Manuscript.getLatestVersionId(
    emailNotification.task.manuscriptId,
    { trx },
  )

  const teamMembers = await Team.findNonInvitedMembersWithUser(
    latestManuscriptVersionId,
    roles,
    { trx },
  )

  return teamMembers.map(member => ({
    email: member.user.email,
    name: member.user.username,
  }))
}

const logTaskEmailNotificationData = async (logData, options = {}) => {
  const { trx } = options
  await TaskEmailNotificationLog.insert(logData, { trx })

  const associatedTask = await Task.findById(logData.taskId, {
    trx,
    related: '[emailNotifications.recipientUser, notificationLogs]',
    throwIfNotFound: false,
  })

  return associatedTask
}

const populateTemplatedTasksForManuscript = async manuscriptId => {
  const groupId = await Manuscript.getGroupId(manuscriptId)

  const activeConfig = await Config.getCached(groupId)

  const { result: newTasks } = await Task.find(
    { manuscriptId: null, groupId },
    {
      orderBy: 'sequenceIndex',
      related: 'emailNotifications(orderByCreated)',
    },
  )

  const { result: existingTasks } = await Task.find(
    { manuscriptId, groupId },
    { orderBy: ['sequenceIndex'] },
  )

  const timezone = activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'

  const endOfToday = Temporal.Now.plainDateISO(timezone)
    .add({ days: 1 })
    .toZonedDateTime(timezone)
    .subtract({ milliseconds: 1 })

  return Task.transaction(async trx => {
    const promises = []

    for (let i = 0; i < newTasks.length; i += 1) {
      const task = {
        ...newTasks[i],
        manuscriptId,
        dueDate: new Date(
          endOfToday.add({ days: newTasks[i].defaultDurationDays })
            .epochMilliseconds,
        ),
        sequenceIndex: i + existingTasks.length,
      }

      delete task.id
      promises.push(
        new Promise((resolve, reject) => {
          Task.insert(task, { trx }).then(taskObject => {
            const emailNotificationPromises = []

            // Start delay at 100ms per notification
            let delay = 0

            for (const emailNotification of taskObject.emailNotifications) {
              const taskEmailNotification = {
                ...emailNotification,
                taskId: taskObject.id,
              }

              delete taskEmailNotification.id

              // Increment the delay by 100ms per notification
              delay += 100

              const emailNotificationPromise = new Promise(
                // eslint-disable-next-line no-loop-func, no-shadow
                (resolve, reject) => {
                  setTimeout(() => {
                    TaskEmailNotification.insert(taskEmailNotification, {
                      trx,
                    })
                      .then(result => resolve(result))
                      .catch(error => reject(error))
                  }, delay)
                },
              )

              emailNotificationPromises.push(emailNotificationPromise)
            }

            Promise.all(emailNotificationPromises)
              .then(result => resolve(result))
              .catch(error => reject(error))
          })
        }),
      )
    }

    return existingTasks.concat(
      (await Promise.all(promises)).sort(
        (a, b) => a.sequenceIndex - b.sequenceIndex,
      ),
    )
  })
}

const sendAutomatedTaskEmailNotifications = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const timezone = activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'
  const startOfToday = Temporal.Now.zonedDateTimeISO(timezone).startOfDay()
  const startOfTomorrow = startOfToday.add({ days: 1 })

  const taskConfigs = config.get('journal').tasks

  const taskEmailNotifications = await Task.getEmailNotifications(
    groupId,
    taskConfigs.status.IN_PROGRESS,
  )

  await Promise.all(
    taskEmailNotifications
      .filter(n => {
        if (n.sentAt || !n.task.dueDate) return false

        const dateOfNotification = Temporal.Instant.fromEpochMilliseconds(
          new Date(n.task.dueDate).getTime(),
        )
          .toZonedDateTimeISO(timezone)
          .add({ milliseconds: 1 }) // Due date is usually 1 ms before midnight, so this pushes it to the following day.
          .add({ days: n.notificationElapsedDays })

        return (
          Temporal.ZonedDateTime.compare(dateOfNotification, startOfToday) >=
            0 &&
          Temporal.ZonedDateTime.compare(dateOfNotification, startOfTomorrow) <
            0
        )
      })
      .map(n => sendNotification(n)),
  )
}

const sendNotification = async n => {
  const taskConfigs = config.get('journal').tasks

  const { recipientTypes } = taskConfigs.emailNotifications
  const { assigneeTypes } = taskConfigs
  let notificationRecipients = []

  let recipientIsExternal = false

  switch (n.recipientType) {
    case recipientTypes.UNREGISTERED_USER:
      if (n.recipientEmail) {
        recipientIsExternal = true
        notificationRecipients = [
          {
            email: n.recipientEmail,
            name: n.recipientName,
          },
        ]
      }

      break

    case recipientTypes.REGISTERED_USER:
      if (n.recipientUser) {
        notificationRecipients = [
          {
            email: n.recipientUser.email,
            name: n.recipientUser.username,
          },
        ]
      }

      break

    case recipientTypes.EDITOR:
      notificationRecipients = await getTeamRecipients(n, [
        recipientTypes.EDITOR,
        recipientTypes.SENIOR_EDITOR,
        recipientTypes.HANDLING_EDITOR,
      ])
      break

    case recipientTypes.REVIEWER:
    case assigneeTypes.COLLABORATIVE_REVIEWER:
    case recipientTypes.AUTHOR:
      notificationRecipients = await getTeamRecipients(n, [n.recipientType])
      break

    case recipientTypes.ASSIGNEE:
      switch (n.task.assigneeType) {
        case assigneeTypes.UNREGISTERED_USER:
          if (n.task.assigneeEmail) {
            recipientIsExternal = true
            notificationRecipients = [
              {
                email: n.task.assigneeEmail,
                name: n.task.assigneeName,
              },
            ]
          }

          break

        case assigneeTypes.REGISTERED_USER:
          if (n.task.assignee) {
            notificationRecipients = [
              {
                email: n.task.assignee.email,
                name: n.task.assignee.username,
              },
            ]
          }

          break

        case assigneeTypes.EDITOR:
          notificationRecipients = await getTeamRecipients(n, [
            assigneeTypes.EDITOR,
            assigneeTypes.SENIOR_EDITOR,
            assigneeTypes.HANDLING_EDITOR,
          ])
          break

        case assigneeTypes.REVIEWER:
        case assigneeTypes.COLLABORATIVE_REVIEWER:
        case assigneeTypes.AUTHOR:
          notificationRecipients = await getTeamRecipients(n, [
            n.task.assigneeType,
          ])
          break
        default:
      }

      break
    default:
  }

  const { manuscript } = n.task

  const editor = await manuscript.getManuscriptEditor()
  const currentUser = editor ? editor.username : ''

  for (const recipient of notificationRecipients) {
    let logData

    if (n.emailTemplateId) {
      try {
        let notificationInput = {
          manuscript,
          selectedTemplate: n.emailTemplateId,
          externalName: recipient.name, // New User username
          currentUser,
          groupId: n.task.groupId,
        }

        if (recipientIsExternal) {
          notificationInput = {
            ...notificationInput,
            externalEmail: recipient.email,
          }
        } else {
          notificationInput = {
            ...notificationInput,
            selectedEmail: recipient.email,
          }
        }

        const emailTemplateOption = n.emailTemplateId.replace(/([A-Z])/g, ' $1')

        const emailTemplate =
          /* eslint-disable-next-line no-await-in-loop */
          await EmailTemplate.findById(emailTemplateOption)

        const messageBody = `${emailTemplate.emailContent.description} sent by Kotahi to ${recipient.name}`

        logData = {
          taskId: n.task.id,
          content: messageBody,
          emailTemplateKey: emailTemplateOption,
          emailTemplateId: emailTemplateOption,
          senderEmail: editor ? editor.email : '',
          recipientEmail: recipient.email,
        }

        const ctx = null
        // eslint-disable-next-line no-await-in-loop
        await sendEmailWithPreparedData(notificationInput, ctx, editor)
        // eslint-disable-next-line no-await-in-loop
        await logTaskEmailNotificationData(logData)
      } catch (error) {
        logger.error(error)
      }
    }
  }
}

const taskAssignee = async task => {
  return (
    task.assignee ||
    User.findById(task.assigneeUserId, { throwIfNotFound: false })
  )
}

const taskEmailNotification = async task => {
  return (
    task.emailNotifications ||
    (
      await TaskEmailNotification.find(
        { taskId: task.id },
        { orderBy: 'created' },
      )
    ).result
  )
}

const taskEmailNotificationRecipientUser = async notification => {
  return (
    notification.recipientUser ||
    User.findById(notification.recipientUserId, { throwIfNotFound: false })
  )
}

const taskNotificationLogs = async task => {
  return (
    task.notificationLogs ||
    (
      await TaskEmailNotificationLog.find(
        { taskId: task.id },
        { orderBy: [{ column: 'created', order: 'desc' }] },
      )
    ).result
  )
}

/** Call this if a task is modified, to regenerate alerts where needed,
 * or remove existing alerts that have become redundant. */
const updateAlertsForTask = async (task, trx) => {
  if (!task.manuscriptId) return
  const isActive = await Manuscript.isActive(task.manuscriptId)

  const needsAlert =
    isActive &&
    task.status === 'In progress' &&
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now()

  // TODO once we start creating alerts for assignees, we need to address that here.

  if (needsAlert) {
    const editorIds = await Manuscript.getEditorIds(task.manuscriptId)

    await TaskAlert.insertIgnoringDuplicates(
      editorIds.map(userId => ({ taskId: task.id, userId })),
      { trx },
    )
  } else {
    await TaskAlert.deleteByTaskId(task.id, { trx })
  }
}

/** Adds alerts for overdue tasks for newly added team members;
 *  removes them for removed team members. */
const updateAlertsUponTeamUpdate = async (
  manuscriptId,
  userIdsToAdd,
  userIdsToRemove,
  options = {},
) => {
  return useTransaction(
    async trx => {
      if (!(await Manuscript.isActive(manuscriptId, { trx }))) return
      const now = new Date()
      const { result: tasks } = await Task.find({ manuscriptId }, { trx })

      const overdueTaskIds = tasks
        .filter(
          task =>
            task.dueDate && task.dueDate < now && task.status === 'In progress',
        )
        .map(task => task.id)

      await Promise.all(
        overdueTaskIds.map(async taskId => {
          const alertsToAdd = userIdsToAdd.map(userId => ({
            taskId,
            userId,
          }))

          await TaskAlert.insertIgnoringDuplicates(alertsToAdd, { trx })

          await TaskAlert.deleteByTaskIdAndUserIds(taskId, userIdsToRemove, {
            trx,
          })
        }),
      )
    },
    { trx: options.trx },
  )
}

const updateTask = async task => {
  const currentCount = await Task.countByManuscript(
    task.manuscriptId,
    task.groupId,
  )

  const existing = await Task.findById(task.id, { throwIfNotFound: false })

  // Ensure that we can't switch a task from one manuscript to another
  const manuscriptId = existing ? existing.manuscriptId : task.manuscriptId
  const sequenceIndex = existing ? existing.sequenceIndex : currentCount

  const taskRecord = {
    ...task,
    manuscriptId,
    groupId: task.groupId,
    sequenceIndex,
  }

  await Task.upsert(taskRecord)

  await updateAlertsForTask(taskRecord)

  return Task.findById(task.id, {
    related:
      '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc)]',
    throwIfNotFound: false,
  })
}

const updateTaskNotification = async taskNotification => {
  await TaskEmailNotification.upsertAndFetch(taskNotification)

  const associatedTask = await Task.findById(taskNotification.taskId, {
    related:
      '[emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc), assignee]',
    throwIfNotFound: false,
  })

  return associatedTask
}

const updateTaskStatus = async task => {
  const taskConfigs = config.get('journal').tasks
  const status = taskConfigs.status

  const data = {
    status: task.status,
  }

  // get task
  const dbTask = await Task.findById(task.id)

  if (
    dbTask.status === status.NOT_STARTED &&
    task.status === status.IN_PROGRESS
  ) {
    const taskDurationDays = dbTask.defaultDurationDays

    const activeConfig = await Config.getCached(dbTask.groupId)
    const timezone = activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'

    data.dueDate =
      taskDurationDays !== null
        ? new Date(
            Temporal.Now.plainDateISO(timezone)
              .add({ days: taskDurationDays + 1 })
              .toZonedDateTime(timezone)
              .subtract({ milliseconds: 1 }).epochMilliseconds,
          )
        : null
  }

  const updatedTask = await Task.patchAndFetchById(task.id, data, {
    related:
      '[assignee, notificationLogs(orderByCreatedDesc), emailNotifications(orderByCreated).recipientUser]',
  })

  await updateAlertsForTask(updatedTask)

  return updatedTask
}

const updateTasks = async (manuscriptId, groupId, tasks) => {
  // Remove any tasks with repeated IDs; ensure manuscriptIds all match
  const distinctTasks = tasks
    .filter((task, i) => tasks.findIndex(t => t.id === task.id) === i)
    .map(task => ({
      ...task,
      manuscriptId,
      groupId,
    }))

  const { result: currentTaskIdRecords } = await Task.find({
    manuscriptId,
    groupId,
  })

  const idsToDelete = currentTaskIdRecords
    .filter(record => !distinctTasks.some(t => t.id === record.id))
    .map(record => record.id)

  return Task.transaction(async trx => {
    await Task.deleteByIds(idsToDelete, { trx })

    const promises = []

    for (let i = 0; i < distinctTasks.length; i += 1) {
      const task = {
        ...distinctTasks[i],
        manuscriptId,
        groupId,
        sequenceIndex: i,
      }

      promises.push(
        Task.upsert(task, {
          trx,
          related:
            '[assignee, notificationLogs(orderByCreatedDesc), emailNotifications(orderByCreated).recipientUser]',
        }),
      )
    }

    const result = (await Promise.all(promises)).sort(
      (a, b) => a.sequenceIndex - b.sequenceIndex,
    )

    await Promise.all(result.map(task => updateAlertsForTask(task, trx)))
    return result
  })
}

const userHasTaskAlerts = async userId => {
  return !!(await TaskAlert.findOne({ userId }))
}

module.exports = {
  createNewTaskAlerts,
  createTaskEmailNotificationLog,
  deleteAlertsForManuscript,
  deleteTaskNotification,
  getTasks,
  populateTemplatedTasksForManuscript,
  sendAutomatedTaskEmailNotifications,
  taskAssignee,
  taskEmailNotification,
  taskEmailNotificationRecipientUser,
  taskNotificationLogs,
  updateAlertsUponTeamUpdate,
  updateTask,
  updateTaskNotification,
  updateTasks,
  updateTaskStatus,
  userHasTaskAlerts,
}

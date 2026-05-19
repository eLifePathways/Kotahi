/* eslint-disable promise/catch-or-return, promise/always-return, promise/no-nesting */

// #region import

const moment = require('moment-timezone')

const { config, logger } = require('@coko/server')

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

const {
  manuscriptIsActive,
  getIdOfLatestVersionOfManuscript,
} = require('./manuscript/manuscriptCommsUtils')

// #endregion import

/** For all tasks that have gone overdue during the previous calendar day, create alerts as appropriate.
 * Don't look further than yesterday, to avoid regenerating alerts that have already been seen. */
const createNewTaskAlerts = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const startOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .startOf('day')

  const startOfYesterday = moment(startOfToday).subtract(1, 'days')

  const overdueTasks = await Task.query()
    .whereNotNull('dueDate')
    .where('dueDate', '<', startOfToday.toDate())
    .where('dueDate', '>=', startOfYesterday.toDate()) // Don't look earlier than yesterday, so we don't recreate alerts that are already dismissed.
    .where({ status: 'In progress', groupId })

  const manuscriptIds = [...new Set(overdueTasks.map(t => t.manuscriptId))]
  const manuscriptMap = {}
  await Promise.all(
    manuscriptIds.map(async manuscriptId => {
      const isActive = await manuscriptIsActive(manuscriptId)

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

  await TaskAlert.query()
    .insert(alertsToInsert)
    .onConflict(['taskId', 'userId'])
    .ignore()
}

const createTaskEmailNotificationLog = async taskEmailNotificationLog => {
  await TaskEmailNotificationLog.query().insert(taskEmailNotificationLog)

  const associatedTask = await Task.query()
    .findById(taskEmailNotificationLog.taskId)
    .withGraphFetched(
      '[assignee, emailNotifications.recipientUser, notificationLogs(orderByCreatedDesc)]',
    )

  return associatedTask
}

const deleteAlertsForManuscript = async manuscriptId => {
  await TaskAlert.query()
    .delete()
    .whereIn('taskId', Task.query().select('id').where({ manuscriptId }))
}

const deleteTaskNotification = async id => {
  const taskEmailNotification = await TaskEmailNotification.query().findById(id)

  const { taskId } = taskEmailNotification

  await TaskEmailNotification.query().deleteById(id)

  const associatedTask = await Task.query()
    .findById(taskId)
    .withGraphFetched(
      '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc)]',
    )

  return associatedTask
}

const getTaskEmailNotifications = async (
  { status = null, groupId },
  options = {},
) => {
  const { trx } = options
  let taskQuery = Task.query(trx) // no await here because it's a sub-query

  if (status) {
    taskQuery = taskQuery.where({ status, groupId })
  }

  return Task.relatedQuery('emailNotifications')
    .for(taskQuery)
    .withGraphFetched('task')
    .withGraphFetched('recipientUser')
    .withGraphFetched('task.assignee')
    .withGraphFetched('task.manuscript')
}

const getTasks = async (manuscriptId, groupId) => {
  return Task.query().where({ manuscriptId, groupId }).orderBy('sequenceIndex')
}

const getTeamRecipients = async (emailNotification, roles, options = {}) => {
  const { trx } = options

  // task notifications through scheduler are supposed to be sent only to team members from latest version of manuscript
  const latestManuscriptVersionId = await getIdOfLatestVersionOfManuscript(
    emailNotification.task.manuscriptId,
    { trx },
  )

  const teamQuery = Team.query(trx)
    .where({
      objectType: 'manuscript',
      objectId: latestManuscriptVersionId,
    })
    .whereIn('role', roles) // no await here because it's a sub-query

  const teamMembers = await Team.relatedQuery('members')
    .where(builder => {
      builder
        .whereNull('status')
        .orWhereNotIn('status', ['invited', 'rejected'])
    })
    .for(teamQuery)
    .withGraphFetched('user')

  return teamMembers.map(member => ({
    email: member.user.email,
    name: member.user.username,
  }))
}

const logTaskEmailNotificationData = async (logData, options = {}) => {
  const { trx } = options
  await TaskEmailNotificationLog.query(trx).insert(logData)

  const associatedTask = await Task.query(trx)
    .findById(logData.taskId)
    .withGraphFetched('[emailNotifications.recipientUser, notificationLogs]')

  return associatedTask
}

const populateTemplatedTasksForManuscript = async manuscriptId => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('groupId')

  const activeConfig = await Config.getCached(manuscript.groupId)

  const newTasks = await Task.query()
    .whereNull('manuscriptId')
    .where({ groupId: manuscript.groupId })
    .orderBy('sequenceIndex')
    .withGraphFetched('emailNotifications(orderByCreated)')

  const existingTasks = await Task.query()
    .where({ manuscriptId, groupId: manuscript.groupId })
    .orderBy('sequenceIndex')

  const endOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .endOf('day')

  return Task.transaction(async trx => {
    const promises = []

    for (let i = 0; i < newTasks.length; i += 1) {
      const task = {
        ...newTasks[i],
        manuscriptId,
        dueDate: moment(endOfToday)
          .add(newTasks[i].defaultDurationDays, 'days')
          .toDate(),
        sequenceIndex: i + existingTasks.length,
      }

      delete task.id
      promises.push(
        new Promise((resolve, reject) => {
          Task.query(trx)
            .insertAndFetch(task)
            .withGraphFetched('assignee')
            .then(taskObject => {
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
                      TaskEmailNotification.query(trx)
                        .insertAndFetch(taskEmailNotification)
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

const removeTaskAlertsForCurrentUser = async userId => {
  return TaskAlert.query().delete().where({ userId })
}

const sendAutomatedTaskEmailNotifications = async groupId => {
  const activeConfig = await Config.getCached(groupId)

  const startOfToday = moment()
    .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
    .startOf('day')

  const startOfTomorrow = moment(startOfToday).add(1, 'days')

  const taskConfigs = config.get('journal').tasks

  const taskEmailNotifications = await getTaskEmailNotifications({
    status: taskConfigs.status.IN_PROGRESS,
    groupId,
  })

  await Promise.all(
    taskEmailNotifications
      .filter(n => {
        if (n.sentAt || !n.task.dueDate) return false

        const dateOfNotification = moment(n.task.dueDate)
          .add(1, 'milliseconds') // Due date is usually 1 ms before midnight, so this pushes it to the following day.
          .add(n.notificationElapsedDays, 'days')

        return (
          dateOfNotification.isSameOrAfter(startOfToday) &&
          dateOfNotification.isBefore(startOfTomorrow)
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
          await EmailTemplate.query().findById(emailTemplateOption)

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
  return task.assignee || User.query().findById(task.assigneeUserId)
}

const taskEmailNotification = async task => {
  return (
    task.emailNotifications ||
    Task.relatedQuery('emailNotifications').for(task.id).orderBy('created')
  )
}

const taskEmailNotificationRecipientUser = async notification => {
  return (
    notification.recipientUser ||
    User.query().findById(notification.recipientUserId)
  )
}

const taskNotificationLogs = async task => {
  return (
    task.notificationLogs ||
    Task.relatedQuery('notificationLogs')
      .for(task.id)
      .orderBy('created', 'desc')
  )
}

/** Call this if a task is modified, to regenerate alerts where needed,
 * or remove existing alerts that have become redundant. */
const updateAlertsForTask = async (task, trx) => {
  if (!task.manuscriptId) return
  const isActive = await manuscriptIsActive(task.manuscriptId)

  const needsAlert =
    isActive &&
    task.status === 'In progress' &&
    task.dueDate &&
    new Date(task.dueDate).getTime() < Date.now()

  // TODO once we start creating alerts for assignees, we need to address that here.

  if (needsAlert) {
    const editorIds = await Manuscript.getEditorIds(task.manuscriptId)

    await TaskAlert.query(trx)
      .insert(editorIds.map(userId => ({ taskId: task.id, userId })))
      .onConflict(['taskId', 'userId'])
      .ignore()
  } else {
    await TaskAlert.query(trx).delete().where({ taskId: task.id })
  }
}

/** Adds alerts for overdue tasks for newly added team members;
 *  removes them for removed team members. */
const updateAlertsUponTeamUpdate = async (
  manuscriptId,
  userIdsToAdd,
  userIdsToRemove,
) => {
  if (!(await manuscriptIsActive(manuscriptId))) return
  const now = new Date()
  const tasks = await Task.query().where({ manuscriptId })

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

      await TaskAlert.query()
        .insert(alertsToAdd)
        .onConflict(['taskId', 'userId'])
        .ignore()

      await TaskAlert.query()
        .delete()
        .where({ taskId })
        .whereIn('userId', userIdsToRemove)
    }),
  )
}

const updateTask = async task => {
  const currentCount = await Task.query()
    .where({ manuscriptId: task.manuscriptId, groupId: task.groupId })
    .resultSize()

  const existing = await Task.query().findById(task.id)

  // Ensure that we can't switch a task from one manuscript to another
  const manuscriptId = existing ? existing.manuscriptId : task.manuscriptId
  const sequenceIndex = existing ? existing.sequenceIndex : currentCount

  const taskRecord = {
    ...task,
    manuscriptId,
    groupId: task.groupId,
    sequenceIndex,
  }

  await Task.query().insert(taskRecord).onConflict('id').merge()

  await updateAlertsForTask(taskRecord)

  return Task.query()
    .findById(task.id)
    .withGraphFetched(
      '[assignee, emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc)]',
    )
}

const updateTaskNotification = async taskNotification => {
  await TaskEmailNotification.query().upsertGraphAndFetch(taskNotification, {
    relate: true,
    insertMissing: true,
  })

  const associatedTask = await Task.query()
    .findById(taskNotification.taskId)
    .withGraphFetched(
      '[emailNotifications(orderByCreated).recipientUser, notificationLogs(orderByCreatedDesc), assignee]',
    )

  return associatedTask
}

const updateTaskStatus = async task => {
  const taskConfigs = config.get('journal').tasks
  const status = taskConfigs.status

  const data = {
    status: task.status,
  }

  // get task
  const dbTask = await Task.query().findById(task.id)

  if (
    dbTask.status === status.NOT_STARTED &&
    task.status === status.IN_PROGRESS
  ) {
    const taskDurationDays = dbTask.defaultDurationDays

    const activeConfig = await Config.getCached(dbTask.groupId)

    data.dueDate =
      taskDurationDays !== null
        ? moment()
            .tz(activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC')
            .endOf('day')
            .add(taskDurationDays, 'days')
        : null
  }

  const updatedTask = await Task.query()
    .patchAndFetchById(task.id, data)
    .withGraphFetched(
      '[assignee, notificationLogs(orderByCreatedDesc), emailNotifications(orderByCreated).recipientUser]',
    )

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

  const currentTaskIdRecords = await Task.query()
    .select('id')
    .where({ manuscriptId, groupId })

  const idsToDelete = currentTaskIdRecords
    .filter(record => !distinctTasks.some(t => t.id === record.id))
    .map(record => record.id)

  return Task.transaction(async trx => {
    await Task.query(trx).delete().whereIn('id', idsToDelete)

    const promises = []

    for (let i = 0; i < distinctTasks.length; i += 1) {
      const task = {
        ...distinctTasks[i],
        manuscriptId,
        groupId,
        sequenceIndex: i,
      }

      promises.push(
        Task.query(trx)
          .insert(task)
          .onConflict('id')
          .merge()
          .returning('*')
          .withGraphFetched(
            '[assignee, notificationLogs(orderByCreatedDesc), emailNotifications(orderByCreated).recipientUser]',
          ),
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
  return (await TaskAlert.query().where({ userId }).limit(1)).length > 0
}

module.exports = {
  createNewTaskAlerts,
  createTaskEmailNotificationLog,
  deleteAlertsForManuscript,
  deleteTaskNotification,
  getTaskEmailNotifications,
  getTasks,
  populateTemplatedTasksForManuscript,
  removeTaskAlertsForCurrentUser,
  sendAutomatedTaskEmailNotifications,
  taskAssignee,
  taskEmailNotification,
  taskEmailNotificationRecipientUser,
  taskNotificationLogs,
  updateAlertsForTask,
  updateAlertsUponTeamUpdate,
  updateTask,
  updateTaskNotification,
  updateTasks,
  updateTaskStatus,
  userHasTaskAlerts,
}

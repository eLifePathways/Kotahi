const { logger } = require('@coko/server')

const NotificationDigest = require('../models/notificationDigest/notificationDigest.model')
const Config = require('../models/config/config.model')
const Group = require('../models/group/group.model')

const ScheduleManager = require('./scheduleManager')

const {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
} = require('../controllers/manuscript/importManuscripts')

const {
  archiveOldManuscripts,
} = require('../controllers/manuscript/manuscriptCommsUtils')

const {
  createNewTaskAlerts,
  sendAutomatedTaskEmailNotifications,
} = require('../controllers/task.controllers')

const {
  sendNotifications,
  deleteActionedEntries,
} = require('../controllers/notification.controllers')

const getJobs = async (activeConfig, groupId) => {
  const jobs = []

  if (activeConfig.formData.manuscript.autoImportHourUtc) {
    // Job 1: Importing and archiving Manuscripts
    jobs.push({
      name: `Importing and archiving Manuscripts - ${groupId}`,
      rule: {
        tz: 'Etc/UTC',
        rule: `00 ${activeConfig.formData.manuscript.autoImportHourUtc} * * *`,
      },
      fn: async () => {
        logger.info(
          `Running scheduler for importing and archiving Manuscripts at ${new Date().toISOString()}`,
        )

        try {
          await importManuscripts(groupId, { user: null })
          await importManuscriptsFromSemanticScholar(groupId, {
            user: null,
          })
          await archiveOldManuscripts(groupId)
        } catch (error) {
          logger.error(error)
        }
      },
    })
  }

  jobs.push(
    // Job 2: Tracking overdue tasks
    {
      name: `Tracking overdue tasks - ${groupId}`,
      rule: {
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `00 00 * * *`,
      },
      fn: async () => {
        logger.info(
          `Running scheduler for tracking overdue tasks ${new Date().toISOString()}`,
        )

        try {
          await createNewTaskAlerts(groupId)
        } catch (error) {
          logger.error(error)
        }
      },
    },
    // Job 3: Sending task email notifications
    {
      name: `Sending task email notifications - ${groupId}`,
      rule: {
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `00 00 * * *`,
      },
      fn: async () => {
        logger.info(
          `Running scheduler for sending task email notifications ${new Date().toISOString()}`,
        )

        try {
          await sendAutomatedTaskEmailNotifications(groupId)
        } catch (error) {
          logger.error(error)
        }
      },
    },
    // Job 4: Delete actioned entries from notification digest
    {
      name: `Delete actioned entries from notification digest - ${groupId}`,
      rule: {
        tz: `${activeConfig.formData.taskManager.teamTimezone || 'Etc/UTC'}`,
        rule: `0 0 * * *`,
      },
      fn: async () => {
        logger.info(
          `Deleting actioned entries from notification digest ${new Date().toISOString()}`,
        )

        try {
          await deleteActionedEntries(groupId)
          await sendAutomatedNotifications(groupId)
        } catch (error) {
          logger.error(error)
        }
      },
    },
    // Other new jobs..
  )

  const result = await Promise.all(jobs)
  return result
}

const sendAutomatedNotifications = async groupId => {
  try {
    const upcomingNotificationDigest = await NotificationDigest.query()
      .select('maxNotificationTime')
      .from(
        NotificationDigest.query()
          .distinctOn(['userId', 'pathString'])
          .where({ groupId })
          .orderBy([
            'userId',
            'pathString',
            { column: 'maxNotificationTime', order: 'asc' },
          ])
          .as('subquery'),
      )
      .where({ actioned: false })
      .orderBy('maxNotificationTime', 'asc')
      .first()

    const upcomingNotificationTime =
      upcomingNotificationDigest?.maxNotificationTime

    if (!upcomingNotificationTime) {
      // console.info('No upcoming notifications found.')
      return
    }

    const currentDate = new Date()

    const notificationTime =
      upcomingNotificationTime <= currentDate
        ? new Date(currentDate.getTime() + 10000)
        : upcomingNotificationTime

    // Schedule to send the first notification at the time it becomes due.
    // This is not a repeating schedule, and will cancel any existing
    // schedule of the same name.
    // This approach means we don't need to poll constantly to see if notifactions have become due.
    const schedule = new ScheduleManager()
    schedule.start(
      `Sending automated alerts - ${groupId}`,
      notificationTime,
      async () => {
        const disableSendNotificationsScheduler =
          process.env.DISABLE_EVENT_NOTIFICATIONS === 'true'

        if (disableSendNotificationsScheduler) {
          return
        }

        logger.info(
          `Running scheduler to send notifications ${new Date().toISOString()}`,
        )

        try {
          await sendNotifications(groupId)
          // Check if another notification is due in future; schedule it if so.
          await sendAutomatedNotifications(groupId)
        } catch (error) {
          logger.error(error)
        }
      },
    )
  } catch (error) {
    logger.error('Error scheduling job:', error)
  }
}

const initiateJobSchedules = async () => {
  const groups = await Group.query().where({ isArchived: false })

  await Promise.all(
    groups.map(async group => {
      const activeConfig = await Config.getCached(group.id)
      const jobs = await getJobs(activeConfig, group.id)

      logger.info(`Schedule Jobs for group "${group.name}" - ${group.id}`)

      jobs.forEach(job => {
        const schedule = new ScheduleManager()
        schedule.start(job.name, job.rule, job.fn)
      })

      await sendAutomatedNotifications(group.id)
    }),
  )
}

module.exports = {
  getJobs,
  initiateJobSchedules,
  sendAutomatedNotifications,
}

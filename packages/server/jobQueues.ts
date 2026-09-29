import sendNotification from './services/notification/sendNotification'
import { eventHandler } from './services/eventManager/eventManager'
import { deleteExpiredUserNotifications } from './controllers/userNotification.controllers'

export default [
  {
    name: 'notification-queue',
    handler: sendNotification,
  },
  {
    name: 'event-queue',
    handler: eventHandler,
  },
  {
    name: 'delete-expired-user-notifications',
    handler: deleteExpiredUserNotifications,
    schedule: '0 0 * * *',
    scheduleTimezone: 'Etc/UTC',
  },
]

import sendNotification from './services/notification/sendNotification'

export default [
  {
    name: 'notification-queue',
    handler: sendNotification,
  },
]

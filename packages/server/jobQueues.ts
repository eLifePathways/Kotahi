import sendNotification from './services/notification/sendNotification'
import { eventHandler } from './services/eventManager/eventManager'

export default [
  {
    name: 'notification-queue',
    handler: sendNotification,
  },
  {
    name: 'event-queue',
    handler: eventHandler,
  },
]

const {
  getUserNotifications,
  dismissUserNotification,
  dismissAllUserNotifications,
} = require('../../../controllers/userNotification.controllers')

module.exports = {
  Query: {
    userNotifications: async (_, __, ctx) => {
      const groupId = ctx.req.headers['group-id']
      return getUserNotifications(ctx.userId, groupId)
    },
  },
  Mutation: {
    dismissUserNotification: async (_, { id }) => {
      const deletedCount = await dismissUserNotification(id)
      return deletedCount > 0
    },
    dismissAllUserNotifications: async (_, __, ctx) => {
      const groupId = ctx.req.headers['group-id']
      await dismissAllUserNotifications(ctx.userId, groupId)
      return true
    },
  },
  UserNotification: {
    data: parent => JSON.stringify(parent.data),
  },
}

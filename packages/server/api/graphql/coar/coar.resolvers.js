const {
  getNotificationsForManuscript,
  getAllNotificationsForGroup,
  reprocessCoarNotifyPayload,
} = require('../../../controllers/coar/coar.controllers')

module.exports = {
  Query: {
    async coarNotificationsForManuscript(_, { manuscriptId }) {
      return getNotificationsForManuscript(manuscriptId)
    },

    async coarNotificationsForGroupOrNone(_, { groupId }) {
      return getAllNotificationsForGroup(groupId)
    },
  },
  Mutation: {
    async resendCoarNotifyPayload(_, { groupId, notificationId, payload }) {
      return reprocessCoarNotifyPayload(groupId, notificationId, payload)
    },
  },
}

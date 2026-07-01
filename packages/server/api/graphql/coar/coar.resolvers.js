const {
  getNotificationsForManuscript,
  getPaginatedNotificationsForGroup,
  reprocessCoarNotifyPayload,
} = require('../../../controllers/coar/coar.controllers')

module.exports = {
  Query: {
    async coarNotificationsForManuscript(_, { manuscriptId }) {
      return getNotificationsForManuscript(manuscriptId)
    },

    async paginatedCoarNotificationsForGroupOrNone(
      _,
      { filters, groupId, limit, offset },
    ) {
      return getPaginatedNotificationsForGroup(groupId, filters, offset, limit)
    },
  },
  Mutation: {
    async resendCoarNotifyPayload(_, { groupId, notificationId, payload }) {
      return reprocessCoarNotifyPayload(groupId, notificationId, payload)
    },
  },
}

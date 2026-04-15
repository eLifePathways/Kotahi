const {
  getNotificationsForManuscript,
} = require('../../../controllers/coar/coar.controllers')

module.exports = {
  Query: {
    async coarNotificationsForManuscript(_, { manuscriptId }) {
      return getNotificationsForManuscript(manuscriptId)
    },
  },
}

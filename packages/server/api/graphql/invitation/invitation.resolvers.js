const {
  addEmailToBlacklist,
  assignUserAsAuthor,
  getBlacklistInformation,
  getInvitationById,
  invitationStatus,
  invitationUser,
  removeInvitation,
  updateInvitationResponse,
  updateInvitationStatus,
  updateSharedStatusForInvitedReviewer,
} = require('../../../controllers/invitation.controllers')

module.exports = {
  Query: {
    async getBlacklistInformation(_, { email, groupId }) {
      return getBlacklistInformation(email, groupId)
    },

    async invitationManuscriptId(_, { id }) {
      return getInvitationById(id)
    },

    async invitationStatus(_, { id }) {
      return invitationStatus(id)
    },
  },

  Mutation: {
    async addEmailToBlacklist(_, { email, groupId }) {
      return addEmailToBlacklist(email, groupId)
    },

    async assignUserAsAuthor(_, { manuscriptId, userId, invitationId }) {
      return assignUserAsAuthor(manuscriptId, userId, invitationId)
    },

    async removeInvitation(_, { id }) {
      return removeInvitation(id)
    },

    async updateInvitationResponse(
      _,
      { id, responseComment, declinedReason, suggestedReviewers },
    ) {
      return updateInvitationResponse(
        id,
        responseComment,
        declinedReason,
        suggestedReviewers,
      )
    },

    async updateInvitationStatus(_, { id, status, userId, responseDate }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return updateInvitationStatus(id, status, userId, responseDate, groupId)
    },

    async updateSharedStatusForInvitedReviewer(_, { invitationId, isShared }) {
      return updateSharedStatusForInvitedReviewer(invitationId, isShared)
    },
  },

  Invitation: {
    async user(parent) {
      return invitationUser(parent)
    },
  },
}

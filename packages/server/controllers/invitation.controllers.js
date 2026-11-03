const { useTransaction } = require('@coko/server')

const {
  BlacklistEmail,
  Invitation,
  Manuscript,
  Team,
  User,
} = require('../models')

const {
  isLatestVersionOfManuscript,
} = require('./manuscript/manuscriptCommsUtils')

const { addUserToManuscriptChatChannel } = require('./channel.controllers')
const seekEvent = require('../services/notification.service')
const { emitEvent } = require('../services/eventManager/eventManager')

const addEmailToBlacklist = async (email, groupId) => {
  const result = await BlacklistEmail.insert({ email, groupId })

  return result
}

const assignUserAsAuthor = async (manuscriptId, userId, invitationId) => {
  return useTransaction(async trx => {
    const existingInvite = await Invitation.findById(invitationId, {
      trx,
      throwIfNotFound: false,
    })

    if (!existingInvite || existingInvite.responseDate) {
      throw new Error('Invalid Invitation ID')
    }

    if (existingInvite.userId && existingInvite.userId !== userId) {
      throw new Error('Invalid User ID')
    }

    await addUserToManuscriptChatChannel({ manuscriptId, userId }, { trx })

    const authorTeam = await Manuscript.assignRole(
      userId,
      manuscriptId,
      'author',
      { trx },
    )

    return Team.findById(authorTeam.id, { related: 'members.[user]', trx })
  })
}

const getBlacklistInformation = async (email, groupId) => {
  const { result: blacklistData } = await BlacklistEmail.find({
    email,
    groupId,
  })

  return blacklistData
}

const getEmailInvitedReviewers = async manuscriptId => {
  if (!manuscriptId) return []

  return Invitation.findNotAcceptedForManuscript(manuscriptId)
}

const getInvitationById = async id => {
  return Invitation.findById(id)
}

const getInvitationsForManuscript = async id => {
  if (!id) return []

  const { result: invitations } = await Invitation.find(
    { manuscriptId: id },
    { related: 'user' },
  )

  return invitations
}

const invitationStatus = async id => {
  const invitation = await Invitation.findById(id)

  const isLatestVersion = await isLatestVersionOfManuscript(
    invitation.manuscriptId,
  )

  if (!isLatestVersion) {
    invitation.status = 'EXPIRED'
  }

  return invitation
}

const invitationUser = async invitation => {
  return (
    invitation.user ||
    User.findById(invitation.userId, { throwIfNotFound: false })
  )
}

const removeInvitation = async id => {
  const invitation = await Invitation.findById(id)
  if (!invitation) return null

  await Invitation.deleteById(id)
  return invitation
}

const updateInvitationResponse = async (
  id,
  responseComment,
  declinedReason,
  suggestedReviewers,
) => {
  return Invitation.patchAndFetchById(id, {
    responseComment,
    declinedReason,
    suggestedReviewers: suggestedReviewers || [],
  })
}

const updateInvitationStatus = async (
  id,
  status,
  userId,
  responseDate,
  groupId,
) => {
  const result = await Invitation.patchIfUnanswered(id, {
    status,
    userId,
    responseDate,
  })

  const relatedUser = await User.findOne({
    email: result.toEmail,
  })

  const { invitedPersonType } = result
  const type = invitedPersonType.toLowerCase()

  if (relatedUser) {
    await Team.patchInvitedMemberStatus(
      result.manuscriptId,
      // TODO this is a temporary solution until we have a proper
      // solution for status with CAPITAL and UNDERSCORES.
      type.replace('collaborative_reviewer', 'collaborativeReviewer'),
      relatedUser.id,
      status.toLowerCase(),
    )
  }

  const manuscript = await Manuscript.findById(result.manuscriptId, {
    throwIfNotFound: false,
  })

  const eventName = {
    author: 'author',
    reviewer: 'review',
    collaborative_reviewer: 'collaborative-review',
  }[type]

  seekEvent(`${eventName}-${status.toLowerCase()}`, {
    manuscript,
    status,
    userId,
    responseDate,
    context: {
      invitation: result,
      reviewerId: userId,
      recipient: 'handlingEditor',
    },
    groupId,
  })

  const isReviewerType =
    type === 'reviewer' || type === 'collaborative_reviewer'

  const upperStatus = status.toUpperCase()

  if (
    isReviewerType &&
    (upperStatus === 'ACCEPTED' || upperStatus === 'REJECTED')
  ) {
    const responseEventType =
      upperStatus === 'ACCEPTED'
        ? 'reviewerAcceptedInvitation'
        : 'reviewerRejectedInvitation'

    const editorIds = await Manuscript.getEditorIds(result.manuscriptId)

    await Promise.all(
      editorIds.map(editorId =>
        emitEvent(responseEventType, {
          userId: editorId,
          groupId,
          manuscriptId: result.manuscriptId,
          shortId: manuscript.shortId,
          reviewerId: userId,
        }),
      ),
    )
  }

  return result
}

const updateSharedStatusForInvitedReviewer = async (invitationId, isShared) => {
  return Invitation.patchAndFetchById(invitationId, { isShared })
}

module.exports = {
  addEmailToBlacklist,
  assignUserAsAuthor,
  getBlacklistInformation,
  getEmailInvitedReviewers,
  getInvitationById,
  getInvitationsForManuscript,
  invitationStatus,
  invitationUser,
  removeInvitation,
  updateInvitationResponse,
  updateInvitationStatus,
  updateSharedStatusForInvitedReviewer,
}

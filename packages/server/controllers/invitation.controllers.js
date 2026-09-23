const {
  BlacklistEmail,
  Invitation,
  Manuscript,
  Team,
  TeamMember,
  User,
} = require('../models')

const {
  isLatestVersionOfManuscript,
} = require('./manuscript/manuscriptCommsUtils')

const { addUserToManuscriptChatChannel } = require('./channel.controllers')
const seekEvent = require('../services/notification.service')

const addEmailToBlacklist = async (email, groupId) => {
  const result = await BlacklistEmail.query().insert({ email, groupId })

  return result
}

const assignUserAsAuthor = async (manuscriptId, userId, invitationId) => {
  const existingInvite = await Invitation.findById(invitationId, {
    throwIfNotFound: false,
  })

  if (!existingInvite || existingInvite.responseDate) {
    throw new Error('Invalid Invitation ID')
  }

  if (existingInvite.userId && existingInvite.userId !== userId) {
    throw new Error('Invalid User ID')
  }

  await addUserToManuscriptChatChannel({
    manuscriptId,
    userId,
  })

  const existingTeam = await Manuscript.relatedQuery('teams')
    .for(manuscriptId)
    .where('role', 'author')
    .first()

  // Add the author to the existing team of authors
  if (existingTeam) {
    const authorExists =
      (await existingTeam
        .$relatedQuery('users')
        .where('users.id', userId)
        .resultSize()) > 0

    if (!authorExists) {
      await TeamMember.query().insert({
        teamId: existingTeam.id,
        userId,
      })
    }

    return existingTeam.$query().withGraphFetched('members.[user]')
  }

  // Create a new team of authors if it doesn't exist
  const newTeam = await Team.query().insert({
    objectId: manuscriptId,
    objectType: 'manuscript',
    role: 'author',
    displayName: 'Author',
  })

  await TeamMember.query().insert({
    userId,
    teamId: newTeam.id,
  })

  return newTeam
}

const getBlacklistInformation = async (email, groupId) => {
  const blacklistData = await BlacklistEmail.query().where({
    email,
    groupId,
  })

  return blacklistData
}

const getEmailInvitedReviewers = async manuscriptId => {
  if (!manuscriptId) return []

  const invitedReviewer = await Invitation.query()
    .where({
      manuscriptId,
    })
    .whereNot('status', 'ACCEPTED')

  return invitedReviewer
}

const getInvitationById = async id => {
  return Invitation.findById(id)
}

const getInvitationsForManuscript = async id => {
  if (!id) return []

  const invitations = await Invitation.query()
    .where({
      manuscriptId: id,
    })
    .withGraphJoined('user')

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
  const result = await Invitation.query().updateAndFetchById(id, {
    responseComment,
    declinedReason,
    suggestedReviewers: suggestedReviewers || [],
  })

  return result
}

const updateInvitationStatus = async (
  id,
  status,
  userId,
  responseDate,
  groupId,
) => {
  const [result] = await Invitation.query()
    .patch({
      status,
      userId,
      responseDate,
    })
    .where({ id, status: 'UNANSWERED' })
    .returning('*')

  const relatedUser = await User.query().findOne({
    email: result.toEmail,
  })

  const { invitedPersonType } = result
  const type = invitedPersonType.toLowerCase()

  if (relatedUser) {
    await Team.relatedQuery('members')
      .for(
        Team.query().findOne({
          objectId: result.manuscriptId,
          // TODO this is a temporary solution until we have a proper
          // solution for status with CAPITAL and UNDERSCORES.
          role: type.replace('collaborative_reviewer', 'collaborativeReviewer'),
        }),
      )
      .patch({ status: status.toLowerCase() })
      .where({ userId: relatedUser.id, status: 'invited' })
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

  return result
}

const updateSharedStatusForInvitedReviewer = async (invitationId, isShared) => {
  const result = await Invitation.query().updateAndFetchById(invitationId, {
    isShared,
  })

  return result
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

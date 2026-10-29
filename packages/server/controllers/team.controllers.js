const Team = require('../models/team/team.model')
const TeamMember = require('../models/teamMember/teamMember.model')
const User = require('../models/user/user.model')
const Message = require('../models/message/message.model')
const Manuscript = require('../models/manuscript/manuscript.model')
const NotificationDigest = require('../models/notificationDigest/notificationDigest.model')

const { updateAlertsUponTeamUpdate } = require('./task.controllers')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('./channel.controllers')

const { evictFromCacheByPrefix } = require('../services/queryCache.service')

const seekEvent = require('../services/notification.service')
const { emitEvent } = require('../services/eventManager/eventManager')

const {
  sendTentativeAcceptCoarNotification,
} = require('./coar/coar.controllers')

const EDITOR_ROLES = ['editor', 'handlingEditor', 'seniorEditor']

const ADDED_EVENT_BY_ROLE = {
  editor: 'addedAsEditor',
  handlingEditor: 'addedAsHandlingEditor',
  seniorEditor: 'addedAsSeniorEditor',
}

const REMOVED_EVENT_BY_ROLE = {
  editor: 'removedAsEditor',
  handlingEditor: 'removedAsHandlingEditor',
  seniorEditor: 'removedAsSeniorEditor',
}

const updateTeam = async (id, input, groupId) => {
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')
  const { objectId, role } = await Team.findById(id)
  const { result: existingMembers } = await TeamMember.find({ teamId: id })
  const existingMemberIds = existingMembers.map(member => member.userId)
  const newMemberIds = input.members.map(member => member.user.id)

  const membersAdded = newMemberIds.filter(
    userId => !existingMemberIds.includes(userId),
  )

  const membersRemoved = existingMemberIds.filter(
    userId => !newMemberIds.includes(userId),
  )

  if (EDITOR_ROLES.includes(role)) {
    const manuscript = await Manuscript.query().findById(objectId)

    const eventData = {
      manuscript,
      membersAdded,
      membersRemoved,
      groupId,
      role,
    }

    if (membersAdded.length) {
      if (role === 'handlingEditor') {
        await sendTentativeAcceptCoarNotification(manuscript, membersAdded)
      }

      seekEvent('team-editor-assigned', eventData)

      await Promise.all(
        membersAdded.map(memberId =>
          emitEvent(ADDED_EVENT_BY_ROLE[role], {
            userId: memberId,
            groupId,
            manuscriptId: objectId,
            shortId: manuscript.shortId,
          }),
        ),
      )
    }

    if (membersRemoved.length) {
      seekEvent('team-editor-unassigned', eventData)

      await Promise.all(
        membersRemoved.map(memberId =>
          emitEvent(REMOVED_EVENT_BY_ROLE[role], {
            userId: memberId,
            groupId,
            manuscriptId: objectId,
            shortId: manuscript.shortId,
          }),
        ),
      )
    }

    await updateAlertsUponTeamUpdate(objectId, membersAdded, membersRemoved)

    const channels = await Manuscript.relatedQuery('channels').for(objectId)

    await Promise.all(
      membersRemoved.map(async userId => {
        // Check if the user has any messages in the channels before removing them from the channelMember
        const hasPostedToChannel = await Message.query()
          .where({ userId })
          .whereIn(
            'channelId',
            channels.map(channel => channel.id),
          )
          .first()

        if (!hasPostedToChannel) {
          await removeUserFromManuscriptChatChannel({
            manuscriptId: objectId,
            userId,
            type: 'all',
          })
          await removeUserFromManuscriptChatChannel({
            manuscriptId: objectId,
            userId,
            type: 'editorial',
          })
          const pathStrings = channels.map(channel => `chat/${channel.id}`)
          await NotificationDigest.query()
            .delete()
            .where({ user_id: userId })
            .whereIn('path_string', pathStrings)
        }
      }),
    )

    await Promise.all(
      input.members.map(async member => {
        await addUserToManuscriptChatChannel({
          manuscriptId: objectId,
          userId: member.user.id,
          type: 'all',
        })
        await addUserToManuscriptChatChannel({
          manuscriptId: objectId,
          userId: member.user.id,
          type: 'editorial',
        })
      }),
    )
  }

  await Promise.all(
    membersRemoved.map(userId => Manuscript.removeRole(userId, objectId, role)),
  )

  await Promise.all(
    membersAdded.map(userId => Manuscript.assignRole(userId, objectId, role)),
  )

  return Team.findById(id, { related: 'members.user' })
}

const updateTeamMember = async (id, input) => {
  // somehow updateandfetchbyid was not working here when changing the isShared field, not sure why
  await TeamMember.query().where({ id }).patch(JSON.parse(input))
  return TeamMember.query().findById(id)
}

const updateCollaborativeTeamMembers = async (manuscriptId, input) => {
  const collaborativeReviewerTeam = await Team.query().findOne({
    objectId: manuscriptId,
    role: 'collaborativeReviewer',
  })

  await TeamMember.query()
    .where({ teamId: collaborativeReviewerTeam.id })
    .update(JSON.parse(input))

  return TeamMember.query().where({
    teamId: collaborativeReviewerTeam.id,
  })
}

const userTeams = async userId => {
  return User.relatedQuery('teams').for(userId)
}

module.exports = {
  updateTeam,
  updateTeamMember,
  updateCollaborativeTeamMembers,
  userTeams,
}

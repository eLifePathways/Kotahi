const { useTransaction } = require('@coko/server')

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
  const { team, manuscript, membersAdded, membersRemoved } =
    await useTransaction(async trx => {
      const { objectId, role } = await Team.findById(id, { trx })

      const { result: existingMembers } = await TeamMember.find(
        { teamId: id },
        { trx },
      )

      const existingMemberIds = existingMembers.map(member => member.userId)
      const newMemberIds = input.members.map(member => member.user.id)

      const added = newMemberIds.filter(
        userId => !existingMemberIds.includes(userId),
      )

      const removed = existingMemberIds.filter(
        userId => !newMemberIds.includes(userId),
      )

      let editedManuscript = null

      if (EDITOR_ROLES.includes(role)) {
        editedManuscript = await Manuscript.query(trx).findById(objectId)

        await updateAlertsUponTeamUpdate(objectId, added, removed, { trx })

        const channels = await Manuscript.relatedQuery('channels', trx).for(
          objectId,
        )

        await Promise.all(
          removed.map(async userId => {
            // Check if the user has any messages in the channels before removing them from the channelMember
            const hasPostedToChannel = await Message.query(trx)
              .where({ userId })
              .whereIn(
                'channelId',
                channels.map(channel => channel.id),
              )
              .first()

            if (!hasPostedToChannel) {
              await removeUserFromManuscriptChatChannel(
                { manuscriptId: objectId, userId, type: 'all' },
                { trx },
              )
              await removeUserFromManuscriptChatChannel(
                { manuscriptId: objectId, userId, type: 'editorial' },
                { trx },
              )
              const pathStrings = channels.map(channel => `chat/${channel.id}`)
              await NotificationDigest.query(trx)
                .delete()
                .where({ user_id: userId })
                .whereIn('path_string', pathStrings)
            }
          }),
        )

        await Promise.all(
          input.members.map(async member => {
            await addUserToManuscriptChatChannel(
              { manuscriptId: objectId, userId: member.user.id, type: 'all' },
              { trx },
            )
            await addUserToManuscriptChatChannel(
              {
                manuscriptId: objectId,
                userId: member.user.id,
                type: 'editorial',
              },
              { trx },
            )
          }),
        )
      }

      await Promise.all(
        removed.map(userId =>
          Manuscript.removeRole(userId, objectId, role, { trx }),
        ),
      )

      await Promise.all(
        added.map(userId =>
          Manuscript.assignRole(userId, objectId, role, { trx }),
        ),
      )

      return {
        team: await Team.findById(id, { related: 'members.user', trx }),
        manuscript: editedManuscript,
        membersAdded: added,
        membersRemoved: removed,
      }
    })

  // Only once committed, so nothing goes out (or gets cached) for a change
  // that was rolled back.
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')

  if (manuscript) {
    const { role } = team

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
            manuscriptId: manuscript.id,
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
            manuscriptId: manuscript.id,
            shortId: manuscript.shortId,
          }),
        ),
      )
    }
  }

  return team
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

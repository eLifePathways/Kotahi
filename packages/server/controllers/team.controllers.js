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

const createTeam = async (input, groupId) => {
  // TODO Only the relate option appears to be used by insertGraphAndFetch, according to Objection docs?
  const options = {
    relate: ['members.user'],
    unrelate: ['members.user'],
    allowUpsert: '[members]',
    eager: '[members.[user.teams]]',
  }

  const { team, events } = await useTransaction(async trx => {
    const eventsToEmit = []

    await Promise.all(
      input.members.map(async member => {
        await addUserToManuscriptChatChannel(
          {
            manuscriptId: input.objectId,
            userId: member.user.id,
            type: 'all',
          },
          { trx },
        )
        await addUserToManuscriptChatChannel(
          {
            manuscriptId: input.objectId,
            userId: member.user.id,
            type: 'editorial',
          },
          { trx },
        )
      }),
    )

    if (EDITOR_ROLES.includes(input.role)) {
      const manuscript = await Manuscript.findById(input.objectId, { trx })
      const editorIds = input.members.map(m => m.user.id)

      if (editorIds.length > 0) {
        await sendTentativeAcceptCoarNotification(manuscript, editorIds, {
          trx,
        })
      }

      seekEvent('team-editor-assigned', {
        manuscript,
        membersAdded: input.members,
        role: input.role,
        groupId,
      })

      editorIds.forEach(memberId =>
        eventsToEmit.push([
          ADDED_EVENT_BY_ROLE[input.role],
          {
            userId: memberId,
            groupId,
            manuscriptId: input.objectId,
            shortId: manuscript.shortId,
          },
        ]),
      )
    }

    // TODO: create PR in coko server to make this a BaseModel function
    const createdTeam = await Team.query(trx).insertGraphAndFetch(
      input,
      options,
    )

    return { team: createdTeam, events: eventsToEmit }
  })

  // Emit only once committed, so a rolled back change doesn't notify anyone
  await Promise.all(events.map(([type, data]) => emitEvent(type, data)))

  return team
}

const updateTeam = async (id, input, groupId) => {
  const { team, events } = await useTransaction(async trx => {
    const eventsToEmit = []
    const existing = await Team.findById(id, { throwIfNotFound: false, trx })

    if (existing && EDITOR_ROLES.includes(existing.role)) {
      const existingMemberIds = (
        await TeamMember.find({ teamId: id }, { trx })
      ).result.map(m => m.userId)

      const newMemberIds = input.members.map(m => m.user.id)

      const membersAdded = newMemberIds.filter(
        userId => !existingMemberIds.includes(userId),
      )

      const membersRemoved = existingMemberIds.filter(
        userId => !newMemberIds.includes(userId),
      )

      const { objectId } = existing
      const manuscript = await Manuscript.findById(objectId, { trx })

      const eventData = {
        manuscript,
        membersAdded,
        membersRemoved,
        groupId,
        role: existing.role,
      }

      if (membersAdded.length) {
        await sendTentativeAcceptCoarNotification(manuscript, membersAdded, {
          trx,
        })

        seekEvent('team-editor-assigned', eventData)

        membersAdded.forEach(memberId =>
          eventsToEmit.push([
            ADDED_EVENT_BY_ROLE[existing.role],
            {
              userId: memberId,
              groupId,
              manuscriptId: objectId,
              shortId: manuscript.shortId,
            },
          ]),
        )
      }

      if (membersRemoved.length) {
        seekEvent('team-editor-unassigned', eventData)

        membersRemoved.forEach(memberId =>
          eventsToEmit.push([
            REMOVED_EVENT_BY_ROLE[existing.role],
            {
              userId: memberId,
              groupId,
              manuscriptId: objectId,
              shortId: manuscript.shortId,
            },
          ]),
        )
      }

      await updateAlertsUponTeamUpdate(objectId, membersAdded, membersRemoved, {
        trx,
      })

      const channels = await Manuscript.relatedQuery('channels', trx).for(
        objectId,
      )

      await Promise.all(
        membersRemoved.map(async userId => {
          // Check if the user has any messages in the channels before removing them from the channelMember
          const hasPostedToChannel = await Message.query(trx)
            .where({ userId })
            .whereIn(
              'channelId',
              channels.map(channel => channel.id),
            )
            .first()

          // Editors share the manuscript chat, so only remove the user once they're in no editor team
          const isStillEditor = await Team.isUserInRolesForObject(
            userId,
            objectId,
            EDITOR_ROLES,
            { trx, excludeTeamId: id },
          )

          if (!hasPostedToChannel && !isStillEditor) {
            await removeUserFromManuscriptChatChannel(
              {
                manuscriptId: objectId,
                userId,
                type: 'all',
              },
              { trx },
            )
            await removeUserFromManuscriptChatChannel(
              {
                manuscriptId: objectId,
                userId,
                type: 'editorial',
              },
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
            {
              manuscriptId: objectId,
              userId: member.user.id,
              type: 'all',
            },
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

    const updatedTeam = await Team.query(trx).upsertGraphAndFetch(
      { id, ...input, role: existing?.role },
      {
        relate: ['members.user'],
        unrelate: ['members.user'],
        eager: 'members.user.teams', // TODO This appears to be ignored, according to Objection documentation?
      },
    )

    return { team: updatedTeam, events: eventsToEmit }
  })

  // Evict only once committed, so a concurrent read can't re-cache the old membership
  evictFromCacheByPrefix('userIs')
  evictFromCacheByPrefix('membersOfTeam')

  // Emit only once committed, so a rolled back change doesn't notify anyone
  await Promise.all(events.map(([type, data]) => emitEvent(type, data)))

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
  createTeam,
  updateTeam,
  updateTeamMember,
  updateCollaborativeTeamMembers,
  userTeams,
}

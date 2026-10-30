const { useTransaction } = require('@coko/server')

const { Channel, ChannelMember, Manuscript } = require('../models')

const addUserToManuscriptChatChannel = async (
  { manuscriptId, userId, type = 'all' },
  options = {},
) => {
  return useTransaction(
    async trx => {
      const manuscript = await Manuscript.query(trx)
        .findById(manuscriptId)
        .select('parentId')

      const channel = await Channel.query(trx)
        .where({
          manuscriptId: manuscript.parentId || manuscriptId,
          type,
        })
        .first()

      const channelMember = await ChannelMember.query(trx)
        .where({
          channelId: channel.id,
          userId,
        })
        .first()

      if (!channelMember) {
        await ChannelMember.query(trx).insert({
          channelId: channel.id,
          userId,
          lastViewed: new Date(),
        })
      }
    },
    { trx: options.trx },
  )
}

const addUsersToChatChannel = async (channelId, userIds) => {
  const uniqueUserIds = [...new Set(userIds)]

  const records = uniqueUserIds.map(userId => ({
    channelId,
    userId,
    lastViewed: new Date(),
  }))

  await ChannelMember.query()
    .insert(records)
    .onConflict(['channelId', 'userId'])
    .merge({ lastViewed: new Date() })
    .returning('*')
}

const getChannelMemberByChannel = async (channelId, userId) => {
  return ChannelMember.query().findOne({ channelId, userId })
}

const getSystemWideDiscussionChannel = async groupId => {
  return Channel.query()
    .whereNull('manuscriptId')
    .where({ topic: 'System-wide discussion', groupId })
    .first()
}

const removeUserFromManuscriptChatChannel = async (
  { manuscriptId, userId = null, type = 'all' },
  options = {},
) => {
  return useTransaction(
    async trx => {
      await ChannelMember.query(trx).delete().where({ userId }).whereExists(
        ChannelMember.relatedQuery('channel').where({
          manuscriptId,
          type,
        }),
      )
    },
    { trx: options.trx },
  )
}

const updateChannelLastViewed = async (channelId, userId) => {
  await ChannelMember.query()
    .patch({ lastViewed: new Date(), lastAlertTriggeredTime: null })
    .where({ channelId, userId })

  return ChannelMember.query().findOne({ channelId, userId })
}

module.exports = {
  addUserToManuscriptChatChannel,
  addUsersToChatChannel,
  getChannelMemberByChannel,
  getSystemWideDiscussionChannel,
  removeUserFromManuscriptChatChannel,
  updateChannelLastViewed,
}

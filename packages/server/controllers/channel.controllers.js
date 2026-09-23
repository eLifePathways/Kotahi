const { Channel, ChannelMember, Manuscript } = require('../models')

const addUserToManuscriptChatChannel = async ({
  manuscriptId,
  userId,
  type = 'all',
}) => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('parentId')

  const channel = await Channel.findOne({
    manuscriptId: manuscript.parentId || manuscriptId,
    type,
  })

  const channelMember = await ChannelMember.findOne({
    channelId: channel.id,
    userId,
  })

  if (!channelMember) {
    await ChannelMember.insert({
      channelId: channel.id,
      userId,
      lastViewed: new Date(),
    })
  }
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
  return ChannelMember.findOne({ channelId, userId })
}

const getSystemWideDiscussionChannel = async groupId => {
  return Channel.query()
    .whereNull('manuscriptId')
    .where({ topic: 'System-wide discussion', groupId })
    .first()
}

const removeUserFromManuscriptChatChannel = async ({
  manuscriptId,
  userId = null,
  type = 'all',
}) => {
  await ChannelMember.query().delete().where({ userId }).whereExists(
    ChannelMember.relatedQuery('channel').where({
      manuscriptId,
      type,
    }),
  )
}

const updateChannelLastViewed = async (channelId, userId) => {
  await ChannelMember.query()
    .patch({ lastViewed: new Date(), lastAlertTriggeredTime: null })
    .where({ channelId, userId })

  return ChannelMember.findOne({ channelId, userId })
}

module.exports = {
  addUserToManuscriptChatChannel,
  addUsersToChatChannel,
  getChannelMemberByChannel,
  getSystemWideDiscussionChannel,
  removeUserFromManuscriptChatChannel,
  updateChannelLastViewed,
}

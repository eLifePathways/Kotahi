const { useTransaction } = require('@coko/server')

const { Channel, ChannelMember, Manuscript } = require('../models')

const addUserToManuscriptChatChannel = async (
  { manuscriptId, userId, type = 'all' },
  options = {},
) => {
  return useTransaction(
    async trx => {
      const firstVersionId = await Manuscript.getFirstVersionId(manuscriptId, {
        trx,
      })

      const channel = await Channel.findOne(
        {
          manuscriptId: firstVersionId,
          type,
        },
        { trx },
      )

      const channelMember = await ChannelMember.findOne(
        {
          channelId: channel.id,
          userId,
        },
        { trx },
      )

      if (!channelMember) {
        await ChannelMember.insert(
          {
            channelId: channel.id,
            userId,
            lastViewed: new Date(),
          },
          { trx },
        )
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

  await ChannelMember.insertOrUpdateLastViewed(records)
}

const getChannelMemberByChannel = async (channelId, userId) => {
  return ChannelMember.findOne({ channelId, userId })
}

const getSystemWideDiscussionChannel = async groupId => {
  return Channel.findOne({
    manuscriptId: null,
    topic: 'System-wide discussion',
    groupId,
  })
}

const removeUserFromManuscriptChatChannel = async (
  { manuscriptId, userId = null, type = 'all' },
  options = {},
) => {
  return useTransaction(
    async trx => {
      await ChannelMember.deleteForUserInManuscriptChannels(
        userId,
        manuscriptId,
        type,
        { trx },
      )
    },
    { trx: options.trx },
  )
}

const updateChannelLastViewed = async (channelId, userId) => {
  await ChannelMember.markViewed(channelId, userId)

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

const { ChannelMember, Message } = require('../models')

const {
  getChannelMemberByChannel,
  addUsersToChatChannel,
} = require('./channel.controllers')

const { notify } = require('./notification.controllers')

const createMessage = async (content, channelId, userId) => {
  const currentUserId = userId

  const savedMessage = await Message.query().insert({
    content,
    userId: currentUserId,
    channelId,
  })

  const message = await Message.query()
    .findById(savedMessage.id)
    .withGraphJoined('[user, channel]')

  // using Set() to avoid having duplicate user ids
  const taggedUserIds = new Set()

  const taggedRegex = /<span class="mention-tag" id="([^"]+)">@([^<]+)<\/span>/g

  let match

  while ((match = taggedRegex.exec(content))) {
    const taggedUserId = match[1]
    taggedUserIds.add(taggedUserId)
  }

  const channelMembers = await ChannelMember.query()
    .where({
      channelId: message.channelId,
    })
    .whereNot({ userId: message.userId })

  await addUsersToChatChannel(channelId, [...taggedUserIds, userId])

  // Notify non-mentioned users
  notify(['chat', message.channelId], {
    time: message.created,
    context: { messageId: message.id },
    users: channelMembers
      .filter(member => !taggedUserIds.has(member.userId))
      .map(member => member.userId),
    groupId: message.channel.groupId,
  })

  // Notify mentioned users
  notify(['chat', message.channelId], {
    time: message.created,
    context: { messageId: message.id, isMentioned: true },
    users: [...taggedUserIds],
    groupId: message.channel.groupId,
    currentUserId,
  })

  return message
}

const deleteMessage = async messageId => {
  const deletedMessage = await Message.query().findById(messageId).first()
  if (!deletedMessage) throw new Error('Message not found')
  await Message.query().deleteById(messageId)
  return deletedMessage
}

const getMessageById = async (messageId, withUser) => {
  if (withUser) {
    return Message.query()
      .findById(messageId)
      .withGraphJoined('user.[defaultIdentity]')
  }

  return Message.findById(messageId)
}

const getMessages = async (channelId, first, before, userId) => {
  let messagesQuery = Message.query()
    .where({ channelId })
    .withGraphJoined('user')
    .limit(first)
    .orderBy('messages.created', 'desc')

  if (before) {
    const firstMessage = await Message.query().findById(before)
    messagesQuery = messagesQuery.where(
      'messages.created',
      '<',
      firstMessage.created,
    )
  }

  const messages = (await messagesQuery).reverse()
  const total = await messagesQuery.resultSize()

  const channelMember = await getChannelMemberByChannel(channelId, userId)

  let unreadMessagesCount = [{ count: 0 }]
  let firstUnreadMessage = null

  if (channelMember) {
    unreadMessagesCount = await Message.query()
      .where({ channelId })
      .where('created', '>', channelMember.lastViewed)
      .count()

    firstUnreadMessage = await Message.query()
      .select('id')
      .where({ channelId })
      .where('created', '>', channelMember.lastViewed)
      .orderBy('created', 'asc')
      .first()
  }

  return {
    edges: messages,
    pageInfo: {
      startCursor: messages[0] && messages[0].id,
      hasPreviousPage: total > first,
    },
    unreadMessagesCount: unreadMessagesCount[0].count,
    firstUnreadMessageId: firstUnreadMessage?.id,
  }
}

const updateMessage = async (messageId, content) => {
  return Message.query().patchAndFetchById(messageId, { content })
}

// Calculates the total number of unread  messages count from more then one channels for the current user.
const unreadMessagesCount = async (channelIds, userId) => {
  const promises = channelIds.map(async channelId => {
    const channelMember = await getChannelMemberByChannel(channelId, userId)

    if (channelMember) {
      const count = await Message.query()
        .where({ channelId })
        .where('created', '>', channelMember.lastViewed)
        .count()

      return parseInt(count[0].count, 10)
    }

    return 0
  })

  const unreadCounts = await Promise.all(promises)

  const totalUnreadMessagesCount = unreadCounts.reduce(
    (acc, count) => acc + count,
    0,
  )

  return totalUnreadMessagesCount
}

module.exports = {
  createMessage,
  deleteMessage,
  getMessageById,
  getMessages,
  updateMessage,
  unreadMessagesCount,
}

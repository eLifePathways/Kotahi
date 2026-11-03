const { ChannelMember, Message } = require('../models')

const {
  getChannelMemberByChannel,
  addUsersToChatChannel,
} = require('./channel.controllers')

const { notify } = require('./notification.controllers')

const createMessage = async (content, channelId, userId) => {
  const currentUserId = userId

  const savedMessage = await Message.insert({
    content,
    userId: currentUserId,
    channelId,
  })

  const message = await Message.findById(savedMessage.id, {
    related: '[user, channel]',
  })

  // using Set() to avoid having duplicate user ids
  const taggedUserIds = new Set()

  const taggedRegex = /<span class="mention-tag" id="([^"]+)">@([^<]+)<\/span>/g

  let match

  while ((match = taggedRegex.exec(content))) {
    const taggedUserId = match[1]
    taggedUserIds.add(taggedUserId)
  }

  const channelMembers = await ChannelMember.findInChannelExcludingUser(
    message.channelId,
    message.userId,
  )

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
  const deletedMessage = await Message.findById(messageId, {
    throwIfNotFound: false,
  })
  if (!deletedMessage) throw new Error('Message not found')
  await Message.deleteById(messageId)
  return deletedMessage
}

const getMessageById = async (messageId, withUser) => {
  if (withUser) {
    return Message.findById(messageId, {
      related: 'user.[defaultIdentity]',
      throwIfNotFound: false,
    })
  }

  return Message.findById(messageId)
}

const getMessages = async (channelId, first, before, userId) => {
  const firstMessage = before ? await Message.findById(before) : null

  const { messages: newestFirst, totalCount: total } =
    await Message.findPageInChannel(channelId, {
      first,
      createdBefore: firstMessage?.created,
    })

  const messages = newestFirst.reverse()

  const channelMember = await getChannelMemberByChannel(channelId, userId)

  let unreadCount = 0
  let firstUnreadMessage = null

  if (channelMember) {
    unreadCount = await Message.countCreatedAfter(
      channelId,
      channelMember.lastViewed,
    )

    firstUnreadMessage = await Message.findFirstCreatedAfter(
      channelId,
      channelMember.lastViewed,
    )
  }

  return {
    edges: messages,
    pageInfo: {
      startCursor: messages[0] && messages[0].id,
      hasPreviousPage: total > first,
    },
    unreadMessagesCount: unreadCount,
    firstUnreadMessageId: firstUnreadMessage?.id,
  }
}

const updateMessage = async (messageId, content) => {
  return Message.patchAndFetchById(messageId, { content })
}

// Calculates the total number of unread  messages count from more then one channels for the current user.
const unreadMessagesCount = async (channelIds, userId) => {
  const promises = channelIds.map(async channelId => {
    const channelMember = await getChannelMemberByChannel(channelId, userId)

    if (channelMember) {
      return Message.countCreatedAfter(channelId, channelMember.lastViewed)
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

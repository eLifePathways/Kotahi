const { subscriptionManager } = require('@coko/server')

const MESSAGE_CREATED = 'MESSAGE_CREATED'
const MESSAGE_UPDATED = 'MESSAGE_UPDATED'
const MESSAGE_DELETED = 'MESSAGE_DELETED'

const {
  createMessage,
  deleteMessage,
  getMessageById,
  getMessages,
  updateMessage,
  unreadMessagesCount,
} = require('../../../controllers/message.controllers')

module.exports = {
  Query: {
    // TO DO: used?
    message: async (_, { messageId }) => {
      return getMessageById(messageId)
    },

    messages: async (_, { channelId, first = 20, before }, ctx) => {
      return getMessages(channelId, first, before, ctx.userId)
    },

    // Calculates the total number of unread  messages count from more then one channels for the current user.
    unreadMessagesCount: async (_, { channelIds }, ctx) => {
      return unreadMessagesCount(channelIds, ctx.userId)
    },
  },

  Mutation: {
    createMessage: async (_, { content, channelId }, ctx) => {
      const createdMessage = await createMessage(content, channelId, ctx.userId)

      subscriptionManager.publish(
        `${MESSAGE_CREATED}.${channelId}`,
        createdMessage.id,
      )

      return createdMessage
    },

    deleteMessage: async (_, { messageId }) => {
      const deletedMessage = await deleteMessage(messageId)

      subscriptionManager.publish(
        `${MESSAGE_DELETED}.${deletedMessage.channelId}`,
        deletedMessage,
      )

      return deletedMessage
    },

    updateMessage: async (_, { messageId, content }) => {
      const updatedMessage = await updateMessage(messageId, content)

      subscriptionManager.publish(
        `${MESSAGE_UPDATED}.${updatedMessage.channelId}`,
        updatedMessage.id,
      )

      return updatedMessage
    },
  },
  Subscription: {
    messageCreated: {
      resolve: async messageId => {
        return getMessageById(messageId, true)
      },
      subscribe: async (_, { channelId }) => {
        return subscriptionManager.asyncIterator(
          `${MESSAGE_CREATED}.${channelId}`,
        )
      },
    },

    messageDeleted: {
      resolve: async deletedMessage => {
        return deletedMessage
      },
      subscribe: async (_, { channelId }) => {
        return subscriptionManager.asyncIterator(
          `${MESSAGE_DELETED}.${channelId}`,
        )
      },
    },

    messageUpdated: {
      resolve: async messageId => {
        return getMessageById(messageId, true)
      },
      subscribe: async (_, { channelId }) => {
        return subscriptionManager.asyncIterator(
          `${MESSAGE_UPDATED}.${channelId}`,
        )
      },
    },
  },
}

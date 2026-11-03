const { BaseModel } = require('@coko/server')

class Message extends BaseModel {
  static get tableName() {
    return 'messages'
  }

  static async hasUserPostedInChannels(userId, channelIds, options = {}) {
    const message = await Message.query(options.trx)
      .where({ userId })
      .whereIn('channelId', channelIds)
      .first()

    return !!message
  }

  static async createMessage({ content, channelId, userId }) {
    const savedMessage = await Message.query().insert({
      content,
      userId,
      channelId,
    })

    const message = await Message.query()
      .findById(savedMessage.id)
      .withGraphJoined('user')

    return message
  }

  /** A page of the channel's messages, newest first, optionally only those created before a given date.
   * totalCount ignores the page size. */
  static async findPageInChannel(channelId, params = {}, options = {}) {
    const { first, createdBefore } = params

    const query = Message.query(options.trx)
      .where({ channelId })
      .withGraphJoined('user')
      .limit(first)
      .orderBy('messages.created', 'desc')

    if (createdBefore) query.where('messages.created', '<', createdBefore)

    const messages = await query
    const totalCount = await query.resultSize()

    return { messages, totalCount }
  }

  static async countCreatedAfter(channelId, date, options = {}) {
    const [{ count }] = await Message.query(options.trx)
      .where({ channelId })
      .where('created', '>', date)
      .count()

    return parseInt(count, 10)
  }

  static async findFirstCreatedAfter(channelId, date, options = {}) {
    return Message.query(options.trx)
      .select('id')
      .where({ channelId })
      .where('created', '>', date)
      .orderBy('created', 'asc')
      .first()
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        channelId: { type: 'string' },
        content: { type: 'string' },
        userId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')
    const Channel = require('../channel/channel.model')

    return {
      channel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: 'messages.channelId',
          to: 'channels.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'messages.userId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = Message

const { BaseModel } = require('@coko/server')

class Message extends BaseModel {
  static get tableName() {
    return 'messages'
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

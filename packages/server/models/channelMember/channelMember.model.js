const { BaseModel } = require('@coko/server')

class ChannelMember extends BaseModel {
  static get tableName() {
    return 'channel_members'
  }

  static get relationMappings() {
    const Channel = require('../channel/channel.model')
    const User = require('../user/user.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'channel_members.userId',
          to: 'users.id',
        },
      },
      channel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Channel,
        join: {
          from: 'channel_members.channelId',
          to: 'channels.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        channelId: { type: 'string', format: 'uuid' },
        lastViewed: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },

        lastAlertTriggeredTime: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
      },
    }
  }
}

module.exports = ChannelMember

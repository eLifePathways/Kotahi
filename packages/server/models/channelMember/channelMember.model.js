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

  /** Inserts the members; for those already in the channel, updates lastViewed instead */
  static async insertOrUpdateLastViewed(members, options = {}) {
    return ChannelMember.query(options.trx)
      .insert(members)
      .onConflict(['channelId', 'userId'])
      .merge({ lastViewed: new Date() })
      .returning('*')
  }

  static async deleteForUserInManuscriptChannels(
    userId,
    manuscriptId,
    type,
    options = {},
  ) {
    return ChannelMember.query(options.trx)
      .delete()
      .where({ userId })
      .whereExists(
        ChannelMember.relatedQuery('channel').where({ manuscriptId, type }),
      )
  }

  static async deleteByChannelIds(channelIds, options = {}) {
    return ChannelMember.query(options.trx)
      .delete()
      .whereIn('channelId', channelIds)
  }

  static async markViewed(channelId, userId, options = {}) {
    return ChannelMember.query(options.trx)
      .patch({ lastViewed: new Date(), lastAlertTriggeredTime: null })
      .where({ channelId, userId })
  }

  static async findInChannelExcludingUser(channelId, userId, options = {}) {
    return ChannelMember.query(options.trx)
      .where({ channelId })
      .whereNot({ userId })
  }
}

module.exports = ChannelMember

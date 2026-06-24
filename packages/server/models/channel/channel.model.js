const { BaseModel } = require('@coko/server')

class Channel extends BaseModel {
  static get tableName() {
    return 'channels'
  }

  static get relationMappings() {
    const Team = require('../team/team.model')
    const ChannelMember = require('../channelMember/channelMember.model')
    const User = require('../user/user.model')
    const Manuscript = require('../manuscript/manuscript.model')
    const Message = require('../message/message.model')
    const Group = require('../group/group.model')
    /* eslint-emable global-require */

    return {
      messages: {
        relation: BaseModel.HasManyRelation,
        modelClass: Message,
        join: {
          from: 'channels.id',
          to: 'messages.channelId',
        },
      },
      members: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChannelMember,
        join: {
          from: 'channels.id',
          to: 'channel_members.channelId',
        },
      },
      team: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Team,
        join: {
          from: 'channels.teamId',
          to: 'teams.id',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'channels.manuscriptId',
          to: 'manuscripts.id',
        },
      },
      users: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'channels.id',
          through: {
            modelClass: require.resolve('../channelMember/channelMember.model'),
            from: 'channel_members.channelId',
            to: 'channel_members.userId',
          },
          to: 'users.id',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'channels.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        type: { type: ['string', 'null'] },
        topic: { type: 'string' },
        teamId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        manuscriptId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        groupId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
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

module.exports = Channel

const { BaseModel } = require('@coko/server')

class Group extends BaseModel {
  static get tableName() {
    return 'groups'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Group'
  }

  static get relationMappings() {
    const Config = require('../config/config.model')

    const Manuscript = require('../manuscript/manuscript.model')

    const Form = require('../form/form.model')

    const Channel = require('../channel/channel.model')

    return {
      configs: {
        relation: BaseModel.HasManyRelation,
        modelClass: Config,
        join: {
          from: 'groups.id',
          to: 'configs.groupId',
        },
      },
      manuscripts: {
        relation: BaseModel.HasManyRelation,
        modelClass: Manuscript,
        join: {
          from: 'groups.id',
          to: 'manuscripts.groupId',
        },
      },
      forms: {
        relation: BaseModel.HasManyRelation,
        modelClass: Form,
        join: {
          from: 'groups.id',
          to: 'forms.groupId',
        },
      },
      channels: {
        relation: BaseModel.HasManyRelation,
        modelClass: Channel,
        join: {
          from: 'groups.id',
          to: 'channels.groupId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: ['string', 'null'] },
        isArchived: { type: ['boolean', 'null'] },
        configs: {
          items: { type: 'object' },
          type: ['array'],
        },
      },
    }
  }
}

Group.type = 'Group'

module.exports = Group

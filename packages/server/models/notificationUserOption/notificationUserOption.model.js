const { BaseModel } = require('@coko/server')

class NotificationUserOption extends BaseModel {
  static get tableName() {
    return 'notification_user_options'
  }

  static get relationMappings() {
    const User = require('../user/user.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'notification_user_options.user_id',
          to: 'users.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        objectId: {
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
        path: { type: 'array', items: { type: 'string' } },
        option: { type: 'string' },
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }

  // eslint-disable-next-line class-methods-use-this
  $formatDatabaseJson(json) {
    if (json.path) {
      json.path = `{${json.path.join(',')}}`
    }

    return json
  }
}

module.exports = NotificationUserOption

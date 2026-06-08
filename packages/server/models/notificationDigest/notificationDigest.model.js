const { BaseModel } = require('@coko/server')
const { debounce } = require('lodash')

class NotificationDigest extends BaseModel {
  static get tableName() {
    return 'notification_digest'
  }

  async $afterInsert(queryContext) {
    await super.$afterInsert(queryContext)

    const { sendAutomatedNotifications } = require('../../utils/jobUtils')

    const debounceSendAutomatedNotifications = debounce(
      sendAutomatedNotifications,
      5000,
    )

    await debounceSendAutomatedNotifications(this.groupId)
  }

  static get relationMappings() {
    const User = require('../user/user.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'notification_digest.user_id',
          to: 'users.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        time: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
          ],
        },
        maxNotificationTime: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
          ],
        },
        pathString: { type: 'string' },
        userId: { type: 'string', format: 'uuid' },
        option: { type: 'string' },
        actioned: { type: 'boolean', default: false },
        context: {
          type: 'object',
          properties: { messageId: { type: ['string', 'null'] } },
        },
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }
}

module.exports = NotificationDigest

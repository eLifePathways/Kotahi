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

  static async deleteUnactionedForPath(userId, pathString, options = {}) {
    return NotificationDigest.query(options.trx).delete().where({
      userId,
      pathString,
      actioned: false,
    })
  }

  static async deleteForUserAndPaths(userId, pathStrings, options = {}) {
    return NotificationDigest.query(options.trx)
      .delete()
      .where({ user_id: userId })
      .whereIn('path_string', pathStrings)
  }

  static async deleteActionedInGroup(groupId, options = {}) {
    return NotificationDigest.query(options.trx)
      .delete()
      .where({ actioned: true, groupId })
  }

  /** The first digest entry for every user and path combination in the group whose
   * max notification time is in the past. */
  static async findFirstDueForEachUserAndPath(groupId, options = {}) {
    return NotificationDigest.query(options.trx)
      .distinctOn(['user_id', 'path_string'])
      .where('max_notification_time', '<', new Date())
      .where({ groupId })
      .orderBy(['user_id', 'path_string', 'max_notification_time'])
  }

  static async markActionedForPath(userId, pathString, groupId, options = {}) {
    return NotificationDigest.query(options.trx)
      .patch({ actioned: true })
      .where({ userId, pathString, groupId })
  }

  static async getUpcomingNotificationTime(groupId, options = {}) {
    const { trx } = options

    const upcomingNotificationDigest = await NotificationDigest.query(trx)
      .select('maxNotificationTime')
      .from(
        NotificationDigest.query(trx)
          .distinctOn(['userId', 'pathString'])
          .where({ groupId })
          .orderBy([
            'userId',
            'pathString',
            { column: 'maxNotificationTime', order: 'asc' },
          ])
          .as('subquery'),
      )
      .where({ actioned: false })
      .orderBy('maxNotificationTime', 'asc')
      .first()

    return upcomingNotificationDigest?.maxNotificationTime
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

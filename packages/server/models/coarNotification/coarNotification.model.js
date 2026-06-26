const { BaseModel } = require('@coko/server')
const Group = require('../group/group.model')
const Manuscript = require('../manuscript/manuscript.model')

class CoarNotification extends BaseModel {
  static get tableName() {
    return 'coar_notifications'
  }

  static get schema() {
    return {
      properties: {
        payload: { type: 'object' },
        manuscriptId: { type: 'string', format: 'uuid' },
        groupId: { type: 'string', format: 'uuid' },
        status: { type: 'boolean' },
      },
    }
  }

  static get relationMappings() {
    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'coar_notifications.groupId',
          to: 'groups.id',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'coar_notifications.manuscriptId',
          to: 'manuscripts.id',
        },
      },
    }
  }

  static async getNotificationsForManuscript(manuscriptId, options = {}) {
    const { trx } = options

    return this.query(trx).where({ manuscriptId }).orderBy('created', 'desc')
  }

  static async getNotificationsAndManuscriptsByGroupOrNone(
    groupId,
    options = {},
  ) {
    const { trx } = options

    return this.query(trx)
      .withGraphFetched('manuscript')
      .where({ groupId })
      .orWhere({ groupId: null })
      .orderBy('created', 'desc')
  }

  static async getOfferNotificationForManuscript(manuscriptId, options = {}) {
    const { trx } = options

    const [offerNotification] = await this.query(trx)
      .where({ manuscriptId })
      .andWhere(builder => {
        builder
          .whereRaw(`payload->>'type' = ?`, ['Offer']) // type is a string
          .orWhereRaw(`payload->'type' @> ?::jsonb`, ['["Offer"]']) // type is an array
      })

    return offerNotification
  }

  static async getOfferNotificationForGroupByIdOrDoi(
    groupId,
    notificationId,
    doi,
    options = {},
  ) {
    if (!notificationId) {
      return undefined
    }

    const { trx } = options

    const [offerNotification] = await CoarNotification.query(trx)
      .where({ groupId })
      .andWhere(builder => {
        builder.whereRaw(`payload->>'id' = ?`, [notificationId])

        if (doi) {
          builder.orWhereRaw(`(payload->'object'->>'ietf:cite-as') ILIKE ?`, [
            `%${doi}%`,
          ])
        }
      })

    return offerNotification
  }
}

module.exports = CoarNotification

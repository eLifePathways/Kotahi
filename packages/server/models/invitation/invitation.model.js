const { BaseModel } = require('@coko/server')

const suggestedReviewerItem = {
  type: 'object',
  additionalProperties: false,
  properties: {
    firstName: { type: ['string', 'null'] },
    lastName: { type: ['string', 'null'] },
    email: {
      anyOf: [
        {
          type: 'string',
          format: 'email',
        },
        {
          type: 'null',
        },
      ],
    },
    affiliation: { type: ['string', 'null'] },
  },
}

const suggestedReviewers = {
  type: ['array'],
  default: [],
  items: suggestedReviewerItem,
}

class Invitation extends BaseModel {
  static get tableName() {
    return 'invitations'
  }

  static async deleteByUserId(userId, options = {}) {
    return Invitation.query(options.trx).where({ userId }).delete()
  }

  static async findNotAcceptedForManuscript(manuscriptId, options = {}) {
    return Invitation.query(options.trx)
      .where({ manuscriptId })
      .whereNot('status', 'ACCEPTED')
  }

  /** Patches the invitation only if it is still unanswered. Returns the patched
   * invitation, or undefined if it was not found or already answered. */
  static async patchIfUnanswered(id, data, options = {}) {
    const [result] = await Invitation.query(options.trx)
      .patch(data)
      .where({ id, status: 'UNANSWERED' })
      .returning('*')

    return result
  }

  static async clearSender(senderId, options = {}) {
    return Invitation.query(options.trx)
      .patch({ senderId: null })
      .where({ senderId })
  }

  static get schema() {
    return {
      properties: {
        date: {
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
        purpose: { type: 'string' },
        toEmail: { type: 'string' },
        status: { type: 'string' },
        senderId: {
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
        invitedPersonType: { type: ['string'] },
        invitedPersonName: { type: ['string'] },
        responseDate: {
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
        responseComment: { type: ['string', 'null'] },
        declinedReason: { type: ['string', 'null'] },
        suggestedReviewers,
        userId: {
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
        isShared: { type: ['boolean'] },
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'invitations.userId',
          to: 'users.id',
        },
      },
    }
  }
}

Invitation.type = 'Invitation'
module.exports = Invitation

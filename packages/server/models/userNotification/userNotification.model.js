const { BaseModel } = require('@coko/server')

class UserNotification extends BaseModel {
  static get tableName() {
    return 'user_notifications'
  }

  static get relationMappings() {
    const User = require('../user/user.model')
    const Group = require('../group/group.model')
    const Manuscript = require('../manuscript/manuscript.model')

    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'user_notifications.user_id',
          to: 'users.id',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'user_notifications.group_id',
          to: 'groups.id',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'user_notifications.manuscript_id',
          to: 'manuscripts.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        groupId: { type: 'string', format: 'uuid' },
        manuscriptId: {
          anyOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }],
        },
        eventType: {
          type: 'string',
          enum: [
            'reviewerAcceptedInvitation',
            'reviewerRejectedInvitation',
            'reviewerCompletedReview',
            'decisionMade',
            'addedAsReviewer',
            'removedAsReviewer',
            'addedAsEditor',
            'removedAsEditor',
            'addedAsHandlingEditor',
            'removedAsHandlingEditor',
            'addedAsSeniorEditor',
            'removedAsSeniorEditor',
          ],
        },
        data: { type: 'object' },
      },
    }
  }
}

UserNotification.type = 'UserNotification'
module.exports = UserNotification

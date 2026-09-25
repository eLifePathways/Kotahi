import { BaseModel, type RelationMappings } from '@coko/server'

import { eventTypes, type Event } from '../../services/eventManager/eventTypes'

class UserNotification extends BaseModel {
  userId: string
  groupId: string
  manuscriptId: string | null
  eventType: Event
  data: Record<string, unknown>

  static get tableName(): string {
    return 'user_notifications'
  }

  static get schema(): object {
    return {
      properties: {
        userId: { type: 'string', format: 'uuid' },
        groupId: { type: 'string', format: 'uuid' },
        manuscriptId: {
          anyOf: [{ type: 'string', format: 'uuid' }, { type: 'null' }],
        },
        eventType: {
          type: 'string',
          enum: [...eventTypes],
        },
        data: { type: 'object' },
      },
    }
  }

  static async findForUser(
    userId: string,
    groupId: string,
  ): Promise<UserNotification[]> {
    return this.query().where({ userId, groupId }).orderBy('created', 'desc')
  }

  static async dismissById(id: string): Promise<number> {
    return this.query().deleteById(id)
  }

  static get relationMappings(): RelationMappings {
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
}

// so that it can be consumed by commonjs modules
export = UserNotification

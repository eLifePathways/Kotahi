const { BaseModel } = require('@coko/server')

// model
class Task extends BaseModel {
  static get tableName() {
    return 'tasks'
  }

  static get modifiers() {
    return {
      orderBySequence(builder) {
        builder.orderBy('sequenceIndex')
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')
    const TaskEmailNotification = require('../taskEmailNotification/taskEmailNotification.model')
    const TaskEmailNotificationLog = require('../taskEmailNotificationLog/taskEmailNotificationLog.model')
    const Manuscript = require('../manuscript/manuscript.model')
    const Group = require('../group/group.model')

    return {
      assignee: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'tasks.assigneeUserId',
          to: 'users.id',
        },
      },
      emailNotifications: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotification,
        join: {
          from: 'tasks.id',
          to: 'task_email_notifications.taskId',
        },
      },
      notificationLogs: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotificationLog,
        join: {
          from: 'tasks.id',
          to: 'task_email_notifications_logs.taskId',
        },
      },
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'tasks.manuscriptId',
          to: 'manuscripts.id',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'tasks.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
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
        title: { type: 'string' },
        assigneeUserId: {
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
        defaultDurationDays: { type: ['integer', 'null'] },
        dueDate: {
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
        reminderPeriodDays: { type: ['integer', 'null'] },
        status: { type: 'string' },
        sequenceIndex: { type: 'integer' },
        assigneeType: { type: ['string', 'null'] },
        assigneeName: { type: ['string', 'null'] },
        assigneeEmail: { type: ['string', 'null'] },
        description: { type: ['string', 'null'] },
      },
    }
  }
}

Task.type = 'UserTask'

module.exports = Task

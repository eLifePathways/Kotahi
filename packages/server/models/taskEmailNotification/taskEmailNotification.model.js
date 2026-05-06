const { BaseModel } = require('@coko/server')

// model
class TaskEmailNotification extends BaseModel {
  static get tableName() {
    return 'task_email_notifications'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'asc')
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')
    const Task = require('../task/task.model')
    const EmailTemplate = require('../emailTemplate/emailTemplate.model')

    return {
      recipientUser: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'task_email_notifications.recipientUserId',
          to: 'users.id',
        },
      },
      task: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'task_email_notifications.taskId',
          to: 'tasks.id',
        },
      },
      emailTemplate: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailTemplate,
        join: {
          from: 'task_email_notifications.emailTemplateId',
          to: 'email_templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        recipientUserId: {
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
        recipientType: { type: ['string', 'null'] },
        notificationElapsedDays: { type: ['integer', 'null'] },
        emailTemplateKey: { type: ['string', 'null'] },
        emailTemplateId: {
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
        recipientName: { type: ['string', 'null'] },
        recipientEmail: { type: ['string', 'null'] },
        sentAt: {
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
      },
    }
  }
}

TaskEmailNotification.type = 'TaskEmailNotification'
module.exports = TaskEmailNotification

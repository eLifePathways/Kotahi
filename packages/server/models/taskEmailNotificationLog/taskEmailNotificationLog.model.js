const { BaseModel } = require('@coko/server')

// model
class TaskEmailNotificationLog extends BaseModel {
  static get tableName() {
    return 'task_email_notifications_logs'
  }

  static get modifiers() {
    return {
      orderByCreatedDesc(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get relationMappings() {
    const Task = require('../task/task.model')

    const EmailTemplate = require('../emailTemplate/emailTemplate.model')

    return {
      task: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Task,
        join: {
          from: 'task_email_notifications_logs.taskId',
          to: 'tasks.id',
        },
      },
      emailTemplate: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: EmailTemplate,
        join: {
          from: 'task_email_notifications_logs.emailTemplateId',
          to: 'email_templates.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        taskId: { type: 'string', format: 'uuid' },
        senderEmail: { type: 'string' },
        recipientEmail: { type: 'string' },
        emailTemplateKey: { type: 'string' },
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
        content: { type: 'string' },
      },
    }
  }
}

TaskEmailNotificationLog.type = 'TaskEmailNotificationLog'
module.exports = TaskEmailNotificationLog

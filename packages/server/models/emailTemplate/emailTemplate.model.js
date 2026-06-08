const { BaseModel } = require('@coko/server')

class EmailTemplate extends BaseModel {
  static get tableName() {
    return 'email_templates'
  }

  static get relationMappings() {
    const TaskEmailNotification = require('../taskEmailNotification/taskEmailNotification.model')

    const TaskEmailNotificationLog = require('../taskEmailNotificationLog/taskEmailNotificationLog.model')

    const Notification = require('../notification/notification.model')

    return {
      taskEmailNotification: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotification,
        join: {
          from: 'email_templates.id',
          to: 'task_email_notifications.emailTemplateId',
        },
      },
      taskEmailNotificationLogs: {
        relation: BaseModel.HasManyRelation,
        modelClass: TaskEmailNotificationLog,
        join: {
          from: 'email_templates.id',
          to: 'task_email_notifications_logs.emailTemplateId',
        },
      },
      notifications: {
        relation: BaseModel.HasManyRelation,
        modelClass: Notification,
        join: {
          from: 'email_templates.id',
          to: 'notifications.emailTemplateId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        emailContent: {
          type: 'object',
          properties: {
            cc: { type: ['string', 'null'] },
            subject: { type: ['string'] },
            body: { type: ['string'] },
            description: { type: ['string'] },
            ccEditors: { type: ['boolean'] },
          },
        },
        emailTemplateType: { type: ['string', 'null'] },
        emailTemplateKey: { type: ['string'] },
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
      },
    }
  }
}

EmailTemplate.type = 'EmailTemplate'
module.exports = EmailTemplate

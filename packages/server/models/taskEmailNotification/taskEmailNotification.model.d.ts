import { BaseModel, Transaction } from '@coko/server'

declare class TaskEmailNotification extends BaseModel {
  taskId: string
  recipientUserId: string | null
  recipientType: string | null
  notificationElapsedDays: number | null
  emailTemplateKey: string | null
  emailTemplateId: string | null
  recipientName: string | null
  recipientEmail: string | null
  sentAt: string | Record<string, unknown> | null

  static deleteByRecipientAndTask(
    recipientUserId: string,
    taskId: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static deleteByEmailTemplateId(
    emailTemplateId: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static upsertAndFetch(
    data: Partial<TaskEmailNotification>,
    options?: { trx?: Transaction },
  ): Promise<TaskEmailNotification>

  static findByTaskId(
    taskId: string,
    options?: { trx?: Transaction },
  ): Promise<TaskEmailNotification[]>
}

export = TaskEmailNotification

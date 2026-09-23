import { BaseModel, Transaction } from '@coko/server'
import TaskEmailNotification from '../taskEmailNotification/taskEmailNotification.model'

declare class Task extends BaseModel {
  manuscriptId: string | null
  groupId: string | null
  title: string
  assigneeUserId: string | null
  defaultDurationDays: number | null
  dueDate: string | Record<string, unknown> | null
  reminderPeriodDays: number | null
  status: string
  sequenceIndex: number
  assigneeType: string | null
  assigneeName: string | null
  assigneeEmail: string | null
  description: string | null

  static getEmailNotifications(
    groupId: string,
    status?: string | null,
    options?: { trx?: Transaction },
  ): Promise<TaskEmailNotification[]>
}

export = Task

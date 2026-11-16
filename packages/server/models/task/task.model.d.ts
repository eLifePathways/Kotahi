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
  static unassignUser(
    userId: string,
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<number>
  static findInProgressDueBetween(
    groupId: string,
    from: Date,
    to: Date,
    options?: { trx?: Transaction },
  ): Promise<Task[]>
  static countByManuscript(
    manuscriptId: string,
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<number>
  static upsert(
    data: Partial<Task>,
    options?: { trx?: Transaction; related?: string },
  ): Promise<Task>
  static findTemplates(
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<Task[]>
}

export = Task

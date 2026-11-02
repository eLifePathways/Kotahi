import { BaseModel, Transaction } from '@coko/server'

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

  static findTemplates(
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<Task[]>
}

export = Task

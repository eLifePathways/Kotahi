import { BaseModel, Transaction } from '@coko/server'

type Options = { trx?: Transaction }

declare class TaskAlert extends BaseModel {
  taskId: string
  userId: string

  static insertIgnoringDuplicates(
    alerts: Pick<TaskAlert, 'taskId' | 'userId'>[],
    options?: Options,
  ): Promise<TaskAlert[]>
  static deleteByManuscriptId(
    manuscriptId: string,
    options?: Options,
  ): Promise<number>
  static deleteByUserId(userId: string, options?: Options): Promise<number>
  static deleteByTaskId(taskId: string, options?: Options): Promise<number>
  static deleteByTaskIdAndUserIds(
    taskId: string,
    userIds: string[],
    options?: Options,
  ): Promise<number>
}

export = TaskAlert

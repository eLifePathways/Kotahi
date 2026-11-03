import { BaseModel, Transaction } from '@coko/server'

declare class NotificationUserOption extends BaseModel {
  userId: string
  objectId: string | null
  path: string[]
  option: string
  groupId: string

  static findExplicitForObject(
    userId: string,
    groupId: string,
    objectId: string | null,
    options?: { trx?: Transaction },
  ): Promise<NotificationUserOption[]>
}

export = NotificationUserOption

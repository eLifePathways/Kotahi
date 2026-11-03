import { BaseModel, Transaction } from '@coko/server'

type NotificationDigestContext = {
  messageId: string | null
}

declare class NotificationDigest extends BaseModel {
  time: string | Record<string, unknown>
  maxNotificationTime: string | Record<string, unknown>
  pathString: string
  userId: string
  option: string
  actioned: boolean
  context: NotificationDigestContext
  groupId: string

  static deleteUnactionedForPath(
    userId: string,
    pathString: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static deleteForUserAndPaths(
    userId: string,
    pathStrings: string[],
    options?: { trx?: Transaction },
  ): Promise<number>

  static deleteActionedInGroup(
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static findFirstDueForEachUserAndPath(
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<NotificationDigest[]>

  static markActionedForPath(
    userId: string,
    pathString: string,
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static getUpcomingNotificationTime(
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<string | Record<string, unknown> | undefined>
}

export = NotificationDigest

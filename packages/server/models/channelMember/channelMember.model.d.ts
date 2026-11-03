import { BaseModel, Transaction } from '@coko/server'

declare class ChannelMember extends BaseModel {
  userId: string
  channelId: string
  lastViewed: string | Record<string, unknown> | null
  lastAlertTriggeredTime: string | Record<string, unknown> | null

  static insertOrUpdateLastViewed(
    members: Pick<ChannelMember, 'channelId' | 'userId' | 'lastViewed'>[],
    options?: { trx?: Transaction },
  ): Promise<ChannelMember[]>

  static deleteForUserInManuscriptChannels(
    userId: string | null,
    manuscriptId: string,
    type: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static deleteByChannelIds(
    channelIds: string[],
    options?: { trx?: Transaction },
  ): Promise<number>

  static markViewed(
    channelId: string,
    userId: string,
    options?: { trx?: Transaction },
  ): Promise<number>

  static findInChannelExcludingUser(
    channelId: string,
    userId: string,
    options?: { trx?: Transaction },
  ): Promise<ChannelMember[]>
}

export = ChannelMember

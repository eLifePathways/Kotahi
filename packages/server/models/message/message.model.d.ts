import { BaseModel, Transaction } from '@coko/server'
import User from '../user/user.model'

type Options = { trx?: Transaction }

declare class Message extends BaseModel {
  channelId: string
  content: string
  userId: string

  static createMessage(args: {
    content: string
    channelId: string
    userId: string
  }): Promise<Message>
  static hasUserPostedInChannels(
    userId: string,
    channelIds: string[],
    options?: Options,
  ): Promise<boolean>
  static findPageInChannel(
    channelId: string,
    params?: {
      first?: number
      createdBefore?: string | Record<string, unknown> | null
    },
    options?: Options,
  ): Promise<{ messages: (Message & { user: User })[]; totalCount: number }>
  static countCreatedAfter(
    channelId: string,
    date: string | Record<string, unknown> | null,
    options?: Options,
  ): Promise<number>
  static findFirstCreatedAfter(
    channelId: string,
    date: string | Record<string, unknown> | null,
    options?: Options,
  ): Promise<Pick<Message, 'id'> | undefined>
}

export = Message

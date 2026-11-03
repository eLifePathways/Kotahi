import { BaseModel, Transaction } from '@coko/server'

declare class Group extends BaseModel {
  name: string | null
  isArchived: boolean | null
  configs: Record<string, unknown>[]

  static findByNamePrefix(
    prefix: string,
    options?: { trx?: Transaction },
  ): Promise<Group[]>

  static archiveByIds(
    ids: string[],
    options?: { trx?: Transaction },
  ): Promise<number>
}

export = Group

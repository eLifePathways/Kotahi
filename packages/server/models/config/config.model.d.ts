import { BaseModel, Transaction } from '@coko/server'
import Group from '../group/group.model'

type Options = { trx?: Transaction }

declare class Config extends BaseModel {
  active: boolean | null
  formData: any
  groupId: string | null

  type: string
  group?: Group

  static cachedConfigsByGroupId: Record<string, Config | undefined>

  static getCached(
    groupId: string,
    options?: Options,
  ): Promise<Config | undefined>
  static beforeUpdate(): Promise<void>
  static beforeDelete(): Promise<void>
}

export = Config

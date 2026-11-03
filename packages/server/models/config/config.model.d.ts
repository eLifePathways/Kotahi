import { BaseModel } from '@coko/server'

declare class Config extends BaseModel {
  active: boolean | null
  formData: any
  groupId: string | null

  static getActive(
    groupId: string,
    options?: { trx?: unknown },
  ): Promise<Config | undefined>

  static patchByGroupId(
    groupId: string,
    data: Partial<Config>,
    options?: { trx?: unknown },
  ): Promise<number>
}

export = Config

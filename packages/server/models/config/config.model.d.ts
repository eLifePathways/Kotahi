import { BaseModel } from '@coko/server'

declare class Config extends BaseModel {
  active: boolean | null
  formData: any
  groupId: string | null

  static getActive(
    groupId: string,
    options?: { trx?: unknown },
  ): Promise<Config | undefined>
}

export = Config

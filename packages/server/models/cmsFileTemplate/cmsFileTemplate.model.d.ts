import { BaseModel, Transaction } from '@coko/server'

declare class CMSFileTemplate extends BaseModel {
  name: string | null
  fileId: string | null
  parentId: string | null
  groupId: string
  rootFolder: boolean

  static setRootFolder(
    id: string,
    groupId: string,
    options?: { trx?: Transaction },
  ): Promise<CMSFileTemplate | undefined>
}

export = CMSFileTemplate

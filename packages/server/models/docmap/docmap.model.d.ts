import { BaseModel, Transaction } from '@coko/server'

declare class Docmap extends BaseModel {
  manuscriptId: string
  groupId: string
  externalId: string
  content: string

  static findByDoi(
    groupId: string,
    prefix: string,
    doi: string,
    options?: { trx?: Transaction },
  ): Promise<Docmap | undefined>

  static patchByExternalId(
    externalId: string,
    groupId: string,
    data: Partial<Pick<Docmap, 'manuscriptId' | 'content'>>,
    options?: { trx?: Transaction },
  ): Promise<number>
}

export = Docmap

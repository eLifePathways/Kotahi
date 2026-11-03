import { BaseModel, Transaction } from '@coko/server'

type Options = { trx?: Transaction }

declare class ThreadedDiscussion extends BaseModel {
  manuscriptId: string
  threads: any

  static findByIdForUpdate(
    id: string,
    options?: Options,
  ): Promise<ThreadedDiscussion | undefined>
  static getManuscriptId(id: string, options?: Options): Promise<string>
  static upsertAndFetch(
    data: Partial<ThreadedDiscussion>,
    options?: Options,
  ): Promise<ThreadedDiscussion>
}

export = ThreadedDiscussion

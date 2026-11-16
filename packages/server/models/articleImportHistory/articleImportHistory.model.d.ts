import { BaseModel, Transaction } from '@coko/server'

declare class ArticleImportHistory extends BaseModel {
  date: string | Record<string, unknown> | null
  sourceId: string | null
  groupId: string | null

  static patchBySourceAndGroup(
    sourceId: string,
    groupId: string,
    data: Partial<Pick<ArticleImportHistory, 'date'>>,
    options?: { trx?: Transaction },
  ): Promise<number>

  static patchByDateAndGroup(
    date: ArticleImportHistory['date'],
    groupId: string,
    data: Partial<Pick<ArticleImportHistory, 'date'>>,
    options?: { trx?: Transaction },
  ): Promise<number>
}

export = ArticleImportHistory

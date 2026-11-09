import { BaseModel, Transaction } from '@coko/server'

type FlaxConfig = {
  shownInMenu: boolean | null
  sequenceIndex: number | null
}

declare class CMSPage extends BaseModel {
  url: string
  title: string
  status: string
  content: string
  meta: any
  creatorId: string | null
  published: string | Record<string, unknown> | null
  edited: string | Record<string, unknown> | null
  flaxHeaderConfig: FlaxConfig
  flaxFooterConfig: FlaxConfig
  groupId: string

  static findInGroupWithFlaxConfig(
    groupId: string,
    configKey: 'flaxHeaderConfig' | 'flaxFooterConfig',
    options?: { trx?: Transaction },
  ): Promise<CMSPage[]>
}

export = CMSPage

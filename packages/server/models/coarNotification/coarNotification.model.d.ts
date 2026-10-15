import { BaseModel, Transaction } from '@coko/server'
import Group from '../group/group.model'
import Manuscript from '../manuscript/manuscript.model'

type Options = { trx?: Transaction }

type Filter = { field: string; value: string }

declare class CoarNotification extends BaseModel {
  payload: Record<string, unknown>
  manuscriptId: string
  groupId: string
  status: boolean

  group?: Group
  manuscript?: Manuscript

  static getNotificationsForManuscript(
    manuscriptId: string,
    options?: Options,
  ): Promise<CoarNotification[]>
  static getPaginatedNotificationsAndManuscriptsByGroupOrNone(
    groupId: string,
    filters: Filter[] | null | undefined,
    offset: number | null | undefined,
    limit: number | null | undefined,
    options?: Options,
  ): Promise<{ messages: CoarNotification[]; totalCount: number }>
  static getOfferNotificationForManuscript(
    manuscriptId: string,
    options?: Options,
  ): Promise<CoarNotification | undefined>
  static getTentativeAcceptNotificationForOffer(
    manuscriptId: string,
    offerId: string,
    options?: Options,
  ): Promise<CoarNotification | undefined>
  static getOfferNotificationForGroupByIdOrDoi(
    groupId: string,
    notificationId: string | null | undefined,
    doi: string | null | undefined,
    options?: Options,
  ): Promise<CoarNotification | undefined>
}

export = CoarNotification

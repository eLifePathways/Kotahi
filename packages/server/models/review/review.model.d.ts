import { BaseModel, Transaction } from '@coko/server'

import User from '../user/user.model'

declare class Review extends BaseModel {
  manuscriptId: string
  userId: string | null
  user: Record<string, unknown> | null
  isDecision: boolean
  isHiddenFromAuthor: boolean
  isHiddenReviewerName: boolean
  isCollaborative: boolean
  isImported: boolean
  isLock: boolean
  canBePublishedPublicly: boolean
  jsonData: any

  static getUsersOfReviews(
    reviews: Pick<Review, 'isCollaborative' | 'manuscriptId' | 'userId'>[],
    options?: { trx?: Transaction },
  ): Promise<User[][]>

  static orderReviewPerUsername<T extends Review>(
    reviews: T[],
    options?: { trx?: Transaction },
  ): Promise<(T & { username: string })[]>
}

export = Review

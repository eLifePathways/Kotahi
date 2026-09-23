import { BaseModel } from '@coko/server'

type UserNotificationEventType =
  | 'reviewerAcceptedInvitation'
  | 'reviewerRejectedInvitation'
  | 'reviewerCompletedReview'
  | 'decisionMade'
  | 'addedAsReviewer'
  | 'removedAsReviewer'
  | 'addedAsEditor'
  | 'removedAsEditor'
  | 'addedAsHandlingEditor'
  | 'removedAsHandlingEditor'
  | 'addedAsSeniorEditor'
  | 'removedAsSeniorEditor'

declare class UserNotification extends BaseModel {
  userId: string
  groupId: string
  manuscriptId: string | null
  eventType: UserNotificationEventType
  data: Record<string, unknown>
}

export = UserNotification

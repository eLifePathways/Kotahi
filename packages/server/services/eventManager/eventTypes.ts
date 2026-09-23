export const eventTypes = [
  'addedAsEditor',
  'addedAsHandlingEditor',
  'addedAsReviewer',
  'addedAsSeniorEditor',
  'decisionMade',
  'removedAsEditor',
  'removedAsHandlingEditor',
  'removedAsReviewer',
  'removedAsSeniorEditor',
  'reviewerAcceptedInvitation',
  'reviewerCompletedReview',
  'reviewerRejectedInvitation',
] as const

export type Event = (typeof eventTypes)[number]

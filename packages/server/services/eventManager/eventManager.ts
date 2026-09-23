import { jobManager } from '@coko/server'

import type { Event } from './eventTypes'
import { UserNotification } from '../../models'

// expand in the future eg. type Trigger = 'userNotification' | 'email'
type Trigger = 'userNotification'

const triggers: Record<Event, Trigger[]> = {
  addedAsEditor: ['userNotification'],
  addedAsHandlingEditor: ['userNotification'],
  addedAsReviewer: ['userNotification'],
  addedAsSeniorEditor: ['userNotification'],
  decisionMade: ['userNotification'],
  removedAsEditor: ['userNotification'],
  removedAsHandlingEditor: ['userNotification'],
  removedAsReviewer: ['userNotification'],
  removedAsSeniorEditor: ['userNotification'],
  reviewerAcceptedInvitation: ['userNotification'],
  reviewerCompletedReview: ['userNotification'],
  reviewerRejectedInvitation: ['userNotification'],
}

const handleUserNotification = async (
  eventType: Event,
  data: any,
): Promise<void> => {
  const { userId, groupId, manuscriptId } = data

  await UserNotification.insert({
    userId,
    groupId,
    manuscriptId,
    eventType,
    data,
  })
}

export const eventHandler = async ({ data }): Promise<void> => {
  const { eventType, ...rest } = data

  if (triggers[eventType].includes('userNotification')) {
    // no await, do not block other triggers
    handleUserNotification(eventType, rest)
  }
}

export const emitEvent = async (eventType: Event, data: any): Promise<void> => {
  await jobManager.sendToQueue('event-queue', { ...data, eventType })
}

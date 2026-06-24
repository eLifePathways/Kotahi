const checkIfInvitationWasAccepted = async ctx => {
  const { Invitation } = require('../../models')
  const { invitation: ctxInvitation } = ctx ?? {}
  const invitation = await Invitation.query().findById(ctxInvitation?.id)

  const isInvitationAccepted = invitation.status === 'ACCEPTED'
  const cancelReason = isInvitationAccepted && 'Invitation was accepted'
  return cancelReason
}

const checkIfReviewWasCompleted = async ctx => {
  const { TeamMember } = require('../../models')
  const { manuscriptId, userId } = ctx ?? {}

  const member = await TeamMember.query()
    .joinRelated('team')
    .where('team.objectId', manuscriptId)
    .andWhere('team_members.userId', userId)
    .first()

  const reviewIsCompleted = member?.status === 'completed'
  const cancelReason = reviewIsCompleted && 'Review was completed'
  return cancelReason
}

/**
 * Determines if the notification should be canceled based on the event and context.
 *
 * @param {string} event - The event name.
 * @param {Object} context - The context object.
 * @returns {Promise<string|boolean>} - Returns a message with the cancel reason if the notification should be canceled, otherwise false.
 */
const shouldCancel = async (event, context) => {
  const eventCancelChecks = {
    'review-invitation-follow-up': checkIfInvitationWasAccepted,
    'collaborative-review-invitation-follow-up': checkIfInvitationWasAccepted,
    'author-invitation-follow-up': checkIfInvitationWasAccepted,
    // TODO: change to follow-up and add another event for just 'review-accepted'
    'review-accepted': checkIfReviewWasCompleted,
  }

  const cancelReason = await eventCancelChecks[event]?.(context)
  return cancelReason
}

const getEventsConfig = async (groupId, event) => {
  const Config = require('../../models/config/config.model')
  const { formData } = (await Config.getCached(groupId)) ?? {}
  return formData?.notification?.eventsConfig[event] ?? {}
}

const sendNotification = async ({ data }) => {
  const { logger } = require('@coko/server')
  const { Message } = require('../../models')
  const { sendEmail } = require('../emailNotifications.service')
  const Notification = require('../../models/notification/notification.model')

  const { context, mailOptions } = data
  const { message, notificationId: id } = context

  const notification = await Notification.findById(id)
  const { active, event, groupId } = notification

  if (!active) return

  const { active: isEventActive } = await getEventsConfig(groupId, event)

  if (!isEventActive) return

  const cancelReason = await shouldCancel(event, context)

  if (cancelReason) {
    logger.info(
      `\nNotification for event: "${event}" was not sent!,\nReason: ${cancelReason}\n`,
    )
    return
  }

  await sendEmail(mailOptions, groupId)

  if (message?.content) {
    await Message.createMessage(message)
  }
}

module.exports = sendNotification

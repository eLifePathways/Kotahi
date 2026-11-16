const { logger, jobManager } = require('@coko/server')
const { Config, EmailTemplate, Notification } = require('../models')
const { objIf } = require('../utils/objectUtils')

const {
  getRecipientsEmails,
  getSeconds,
} = require('./emailNotifications.service')

const { processData, useHandlebars } = require('./handlebars.service')

/**
 * Prepares and sends the notification to the queue.
 *
 * @param {Object} notification - The notification object.
 * @param {Object} data - The data for the notification.
 * @param {Object} params.data.context - The context for the notification.
 * @param {string} [data.queueName='notification-queue'] - The name of the queue.
 * @param {Object} data.manuscript - The manuscript data.
 * @returns {Promise<void>}
 */
const prepareAndSendToQueue = async ({ notification, data }) => {
  const { context, queueName = 'notification-queue', ...restData } = data
  const { manuscript } = restData
  const { id: manuscriptId } = manuscript ?? {}

  const { ccEmails, recipient, emailTemplateId, groupId, delay, event } =
    notification

  const templateId = context?.templateId || emailTemplateId
  const template = await EmailTemplate.findById(templateId)
  const { subject: templateSubject, body } = template.emailContent

  const { to, cc, recipientUser } = await getRecipientsEmails({
    ccEmails,
    recipient,
    manuscriptId,
    groupId,
    contextRecipient: context?.recipient,
  })

  if ((!to || !to?.length) && !recipientUser) {
    logger.info(`No recipient found for event: "${event}"`)
    return
  }

  const variables = { ...restData, recipientUser }
  const handlebarsData = await processData(variables, groupId)

  const subject = notification.subject || templateSubject

  const mailOptions = {
    to,
    cc,
    subject: useHandlebars(subject, handlebarsData),
    content: useHandlebars(body, handlebarsData),
  }

  const { invitation, reviewerId, reviewAction, messageContent } = context ?? {}
  const invitationId = invitation?.id
  let message = false

  if (messageContent?.content) {
    const content = useHandlebars(messageContent.content, handlebarsData)
    message = { ...messageContent, content }
  }

  const queueData = {
    mailOptions,
    context: {
      notificationId: notification.id,
      ...objIf(message, message),
      ...objIf(manuscriptId, { manuscriptId }),
      ...objIf(delay, {
        ...objIf(reviewerId, { reviewerId }),
        ...objIf(invitationId, { invitationId }),
        ...objIf(reviewAction, { reviewAction }),
        ...objIf(manuscriptId, { manuscriptId }),
      }),
    },
  }

  const queueOptions = {
    ...objIf(delay, { startAfter: getSeconds(delay).days }),
  }

  await jobManager.sendToQueue(queueName, queueData, queueOptions)
}

/**
 * Seeks for a event and processes the related notifications (one event can contain multiple notifications).
 *
 * @param {string} event - The event trigger.
 * @param {Object} data - The data for the event.
 * @param {string} data.groupId - The group ID.
 * @param {Object} data.context - The context for the event.
 * @returns {Promise<Object>} - The result of the event processing.
 */
const seekEvent = async (event, data) => {
  try {
    const { groupId, context, currentUser } = data
    const { formData } = (await Config.getCached(groupId)) ?? {}
    const { eventsConfig } = formData?.notification ?? {}
    const eventIsActive = eventsConfig?.[event]?.active

    if (!eventIsActive) {
      logger.info(`\nNo active event found for: "${event}"\n`)
      return { success: false }
    }

    logger.info(
      `\nFound active event: "${event}",\n...Searching for active notifications\n`,
    )

    const { result: notifications } = await Notification.find({
      event,
      active: true,
      groupId,
    })

    logger.info(
      `Found ${notifications.length} active notifications for event: "${event}"\n`,
    )

    if (!notifications.length) return { success: false }

    const sendToQueue = notifications.map(async notification => {
      const { emailTemplateId, recipient, isDefault } = notification
      const { recipient: ctxRecipient, ...restCtx } = context ?? {}

      // leave out the context recipient if it's not a default notification
      const newContext = {
        ...restCtx,
        ...objIf(isDefault, { recipient: ctxRecipient }),
      }

      const noRecipient = !recipient && newContext?.recipient
      if (!emailTemplateId || noRecipient) return { success: false }

      return prepareAndSendToQueue({
        notification,
        data: { ...data, context: newContext, senderName: currentUser },
      })
    })

    await Promise.all(sendToQueue)
    return { success: true }
  } catch (e) {
    logger.error(e)
    return { success: false }
  }
}

module.exports = seekEvent

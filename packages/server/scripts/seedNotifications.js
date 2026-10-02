const { Notification, EmailTemplate } = require('../models')
const eventsSource = require('../services/notification/eventsSource')
const { objIf } = require('../utils/objectUtils')

const { entries } = Object

const eventsToTemplatesInConfig = async (config, groupId, trx) => {
  const { eventNotification } = config.formData

  const findTemplateByType = async type =>
    EmailTemplate.findOne({ emailTemplateType: type, groupId }, { trx }) ?? {}

  const {
    mentionNotificationTemplate,
    reviewRejectedEmailTemplate,
    evaluationCompleteEmailTemplate,
    alertUnreadMessageDigestTemplate,
    submissionConfirmationEmailTemplate,
    authorProofingSubmittedEmailTemplate,
    authorProofingInvitationEmailTemplate,
    reviewerInvitationPrimaryEmailTemplate,
    reviewerCollaborativeInvitationPrimaryEmailTemplate,
  } = eventNotification ?? {}

  const { id: authorInvitation } =
    (await findTemplateByType('authorInvitation')) || {}

  const eventsToTemplates = {
    'author-invitation': authorInvitation,
    'decision-form-make-decision': evaluationCompleteEmailTemplate,
    'manuscript-submit': submissionConfirmationEmailTemplate,
    'author-proofing-submit-feedback': authorProofingSubmittedEmailTemplate,
    'author-proofing-assign': authorProofingInvitationEmailTemplate,
    'review-invitation': reviewerInvitationPrimaryEmailTemplate,
    'collaborative-review-invitation':
      reviewerCollaborativeInvitationPrimaryEmailTemplate,
    'chat-mention': mentionNotificationTemplate,
    'review-rejected': reviewRejectedEmailTemplate,
    'chat-unread': alertUnreadMessageDigestTemplate,
  }

  await Promise.all(
    entries(eventsToTemplates).map(async ([event, emailTemplateId]) => {
      if (!emailTemplateId) {
        delete eventsToTemplates[event]
      } else {
        const template = await EmailTemplate.findOne(
          { id: emailTemplateId, groupId },
          { trx },
        )

        if (!template) {
          delete eventsToTemplates[event]
          return
        }

        const { emailContent } = template
        const { cc = '', subject } = emailContent ?? {}
        eventsToTemplates[event] = {
          emailTemplateId,
          ccEmails: cc ? cc.split(',').map(e => e.trim()) : [],
          subject,
        }
      }
    }),
  )

  return eventsToTemplates
}

const seedNotifications = async (trx, groupId, config) => {
  const { totalCount: groupEvents } = await Notification.find(
    { groupId },
    { trx },
  )

  if (groupEvents) return

  const templates = await eventsToTemplatesInConfig(config, groupId, trx)

  const addDefaultNotificationsAndMigrateOld = entries(eventsSource).map(
    async ([event, src]) => {
      if (!src.recipient) return
      const { delay, recipient, notificationType } = src

      const {
        emailTemplateId = null,
        ccEmails = [],
        subject,
      } = templates[event] ?? {}

      const displayName = event
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      const updatedNotification = {
        event,
        groupId,
        recipient,
        displayName,
        notificationType,
        emailTemplateId,
        ccEmails,
        subject,
        isDefault: true,
        active: !!(recipient && emailTemplateId),
        ...objIf(Number(delay), { delay }),
      }

      await Notification.insert(updatedNotification, { trx })
    },
  )

  await Promise.all(addDefaultNotificationsAndMigrateOld)
}

module.exports = { seedNotifications }

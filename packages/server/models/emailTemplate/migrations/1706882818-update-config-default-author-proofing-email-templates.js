const { useTransaction } = require('@coko/server')

const Config = require('../../config/config.model')
const EmailTemplate = require('../emailTemplate.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      configs.forEach(async config => {
        const authorProofingInvitationTemplate =
          await EmailTemplate.query().findOne({
            groupId: config.groupId,
            emailTemplateType: 'authorProofingInvitation',
          })

        const authorProofingSubmittedTemplate =
          await EmailTemplate.query().findOne({
            groupId: config.groupId,
            emailTemplateType: 'authorProofingSubmitted',
          })

        const newConfig = config
        newConfig.formData.eventNotification.authorProofingInvitationEmailTemplate =
          authorProofingInvitationTemplate.id
        newConfig.formData.eventNotification.authorProofingSubmittedEmailTemplate =
          authorProofingSubmittedTemplate.id

        await Config.query().updateAndFetchById(config.id, newConfig)
      })
    }
  })
}

const { useTransaction } = require('@coko/server')

const EmailTemplate = require('../emailTemplate.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const emailTemplates = await EmailTemplate.query(trx)
      const groups = await Group.query(trx)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        emailTemplates.length >= 1 &&
        !emailTemplates[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await EmailTemplate.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

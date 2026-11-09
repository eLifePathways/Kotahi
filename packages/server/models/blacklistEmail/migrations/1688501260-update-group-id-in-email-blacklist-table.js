const { useTransaction } = require('@coko/server')

const BlacklistEmail = require('../blacklistEmail.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const { result: blacklistEmails } = await BlacklistEmail.find({}, { trx })
      const { result: groups } = await Group.find({}, { trx })

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        blacklistEmails.length >= 1 &&
        !blacklistEmails[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await BlacklistEmail.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

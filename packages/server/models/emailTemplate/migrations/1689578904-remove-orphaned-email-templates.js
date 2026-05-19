const { useTransaction } = require('@coko/server')

const EmailTemplate = require('../emailTemplate.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      if (groups.length === 0) {
        await EmailTemplate.query(trx).delete().where({
          groupId: null,
        })
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

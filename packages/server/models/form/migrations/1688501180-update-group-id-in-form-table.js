const { useTransaction } = require('@coko/server')

const Form = require('../form.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const forms = await Form.query(trx)
      const groups = await Group.query(trx)

      // logger.info(`Existing Forms count: ${forms.length}`)
      // logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && forms.length >= 1 && !forms[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Form.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        // logger.info('groupId patched successfully in form table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

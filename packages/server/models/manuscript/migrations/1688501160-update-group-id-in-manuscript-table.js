const { useTransaction } = require('@coko/server')

const Manuscript = require('../manuscript.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const { result: manuscripts } = await Manuscript.find({}, { trx })
      const { result: groups } = await Group.find({}, { trx })

      // logger.info(`Existing Manuscripts count: ${manuscripts.length}`)
      // logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (
        groups.length >= 1 &&
        manuscripts.length >= 1 &&
        !manuscripts[0].group_id
      ) {
        /* eslint no-param-reassign: "error" */
        await Manuscript.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)

        // logger.info('groupId patched successfully in manuscript table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

const { useTransaction } = require('@coko/server')

const Config = require('../config.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const configs = await Config.query(trx)
      const groups = await Group.query(trx)

      // logger.info(`Existing Configs count: ${configs.length}`)
      // logger.info(`Existing Groups count: ${groups.length}`)

      // Existing instances migrating to multi-tenancy groups
      if (configs.length === 1 && groups.length >= 1 && !configs[0].group_id) {
        const config = {
          groupId: groups[0].id,
        }

        /* eslint no-param-reassign: "error" */
        await Config.query(trx).patchAndFetchById(configs[0].id, config)

        // logger.info('groupId patched successfully in config table')
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

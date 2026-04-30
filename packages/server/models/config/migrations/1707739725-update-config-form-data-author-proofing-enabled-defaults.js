const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          newConfig.formData.controlPanel.authorProofingEnabled = false

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

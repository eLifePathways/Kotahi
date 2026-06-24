const { useTransaction } = require('@coko/server')
const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    await Promise.all(
      configs.map(async config => {
        const newConfig = config

        if (!newConfig.formData.emailNotification) {
          newConfig.formData.emailNotification = {}
        }

        newConfig.formData.emailNotification.bcc = ''
        await Config.query(trx).patchAndFetchById(config.id, newConfig)
      }),
    )
  })
}

exports.down = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    await Promise.all(
      configs.map(async config => {
        const newConfig = config
        delete newConfig.formData.emailNotification.bcc
        await Config.query(trx).patchAndFetchById(config.id, newConfig)
      }),
    )
  })
}

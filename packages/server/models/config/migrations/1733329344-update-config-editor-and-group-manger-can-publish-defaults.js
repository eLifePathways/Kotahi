const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          newConfig.formData.controlPanel.editorsCanPublish = true
          newConfig.formData.controlPanel.groupManagersCanPublish = true

          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

exports.down = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (newConfig.formData.controlPanel.editorsCanPublish !== undefined) {
            delete newConfig.formData.controlPanel.editorsCanPublish
          }

          if (
            newConfig.formData.controlPanel.groupManagersCanPublish !==
            undefined
          ) {
            delete newConfig.formData.controlPanel.groupManagersCanPublish
          }

          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

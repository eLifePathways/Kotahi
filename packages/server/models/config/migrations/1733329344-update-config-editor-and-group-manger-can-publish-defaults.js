const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          newConfig.formData.controlPanel = {
            ...newConfig.formData.controlPanel,
            editorsCanPublish: true,
            groupManagersCanPublish: true,
          }

          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

exports.down = async () => {
  return useTransaction(async trx => {
    const { result: configs } = await Config.find({}, { trx })

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (
            newConfig.formData.controlPanel?.editorsCanPublish !== undefined
          ) {
            delete newConfig.formData.controlPanel.editorsCanPublish
          }

          if (
            newConfig.formData.controlPanel?.groupManagersCanPublish !==
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

const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

const eventsSource = require('../../../services/notification/eventsSource')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      const eventsConfig = Object.keys(eventsSource).reduce((acc, key) => {
        acc[key] = { active: true }
        return acc
      }, {})

      await Promise.all(
        configs.map(async config => {
          const newConfig = config
          newConfig.formData.notification.eventsConfig = eventsConfig
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
          delete newConfig.formData.notification.eventsConfig
          await Config.query(trx).updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

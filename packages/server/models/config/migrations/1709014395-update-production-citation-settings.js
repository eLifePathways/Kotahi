const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (!newConfig.formData.production) {
            newConfig.formData.production = {}
          }

          if (!newConfig.formData.production.citationStyles) {
            newConfig.formData.production.citationStyles = {}
          }

          if (!newConfig.formData.production.citationStyles.styleName) {
            newConfig.formData.production.citationStyles.styleName =
              newConfig.formData.production.styleName || 'apa'
          }

          if (!newConfig.formData.production.citationStyles.localeName) {
            newConfig.formData.production.citationStyles.localeName =
              newConfig.formData.production.localeName || 'en-US'
          }

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

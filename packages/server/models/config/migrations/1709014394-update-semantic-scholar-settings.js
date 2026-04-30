const { useTransaction } = require('@coko/server')

const { config: variableConfig } = require('@coko/server')

const Config = require('../config.model')

const shouldRunDefaultImportsForColab = [true, 'true'].includes(
  variableConfig.get('import-for-prc').default_import,
)

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const newConfig = config

          if (
            newConfig.formData.instanceName === 'prc' &&
            shouldRunDefaultImportsForColab === true
          ) {
            let existingRecencyPeriodDays

            const publishingServers = [
              'arXiv',
              'bioRxiv',
              'ChemRxiv',
              'medRxiv',
              'research square',
            ]

            if (
              newConfig.formData.manuscript
                .semanticScholarImportsRecencyPeriodDays
            ) {
              existingRecencyPeriodDays =
                newConfig.formData.manuscript
                  .semanticScholarImportsRecencyPeriodDay

              newConfig.formData.manuscript.semanticScholarImportsRecencyPeriodDays =
                undefined
            }

            if (!newConfig.formData.semanticScholar) {
              newConfig.formData.semanticScholar = {}
            }

            newConfig.formData.semanticScholar.enableSemanticScholar = true
            newConfig.formData.semanticScholar.semanticScholarImportsRecencyPeriodDays =
              existingRecencyPeriodDays ?? 42
            newConfig.formData.semanticScholar.semanticScholarPublishingServers =
              publishingServers
          }

          await Config.query().updateAndFetchById(config.id, newConfig)
        }),
      )
    }
  })
}

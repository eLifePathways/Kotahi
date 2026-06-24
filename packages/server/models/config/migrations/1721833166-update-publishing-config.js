const { useTransaction } = require('@coko/server')

const Config = require('../config.model')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    await Promise.all(
      configs.map(async config => {
        const newConfig = config

        if (
          !newConfig.formData.groupIdentity.title &&
          newConfig.formData.publishing?.crossref?.journalName
        ) {
          newConfig.formData.groupIdentity.title =
            newConfig.formData.publishing.crossref.journalName
          delete newConfig.formData.publishing.crossref.journalName
        }

        if (
          !newConfig.formData.groupIdentity.journalAbbreviatedName &&
          newConfig.formData.publishing?.crossref?.journalAbbreviatedName
        ) {
          newConfig.formData.groupIdentity.journalAbbreviatedName =
            newConfig.formData.publishing.crossref.journalAbbreviatedName
          delete newConfig.formData.publishing.crossref.journalAbbreviatedName
        }

        if (
          !newConfig.formData.groupIdentity.licenseUrl &&
          newConfig.formData.publishing?.crossref?.licenseUrl
        ) {
          newConfig.formData.groupIdentity.licenseUrl =
            newConfig.formData.publishing.crossref.licenseUrl
          delete newConfig.formData.publishing.crossref.licenseUrl
        }

        if (!newConfig.formData.groupIdentity.electronicIssn) {
          newConfig.formData.groupIdentity.electronicIssn = ''
        }

        if (!newConfig.formData.groupIdentity.language) {
          newConfig.formData.groupIdentity.language = ''
        }

        if (!newConfig.formData.integrations) {
          newConfig.formData.integrations = {}
        }

        if (newConfig.formData.semanticScholar) {
          newConfig.formData.integrations.semanticScholar =
            newConfig.formData.semanticScholar
          delete newConfig.formData.semanticScholar
        }

        if (newConfig.formData.kotahiApis) {
          newConfig.formData.integrations.kotahiApis =
            newConfig.formData.kotahiApis
          delete newConfig.formData.kotahiApis
        }

        if (newConfig.formData.coarNotify) {
          newConfig.formData.integrations.coarNotify =
            newConfig.formData.coarNotify
          delete newConfig.formData.coarNotify
        }

        if (newConfig.formData.aiDesignStudio) {
          newConfig.formData.integrations.aiDesignStudio =
            newConfig.formData.aiDesignStudio
          delete newConfig.formData.aiDesignStudio
        }

        await Config.query(trx).updateAndFetchById(config.id, newConfig)
      }),
    )
  })
}

/* eslint-disable promise/catch-or-return */

const { config, logger } = require('@coko/server')
const { subscriptionManager } = require('@coko/server')

const Config = require('../../models/config/config.model')

const importArticlesFromBiorxiv = require('../../services/importArticles/biorxiv-import')
const importArticlesFromBiorxivWithFullTextSearch = require('../../services/importArticles/biorxiv-full-text-import')
const importArticlesFromPubmed = require('../../services/importArticles/pubmed-import')
const importArticlesFromSemanticScholar = require('../../services/importArticles/semantic-scholar-papers-import')
const { runImports } = require('../../services/plugins/imports')

const importsInProgress = new Set()

const shouldRunDefaultImportsForColab = [true, 'true'].includes(
  config.get('import-for-prc').default_import,
)

const importManuscripts = async (groupId, ctx) => {
  // eslint-disable-next-line no-console
  console.log(`Importing manuscripts. Triggered by ${ctx.userId ?? 'system'}`)
  const key = `${groupId}-imports`

  if (importsInProgress.has(key)) {
    // eslint-disable-next-line no-console
    console.log('Import already in progress. Aborting new import')
    return false
  }

  try {
    importsInProgress.add(key)

    const activeConfig = await Config.query().findOne({
      groupId,
      active: true,
    })

    const evaluatedStatusString = ['preprint2', 'preprint1'].includes(
      activeConfig.formData.instanceName,
    )
      ? 'evaluated'
      : 'accepted'

    const promises = [runImports(groupId, evaluatedStatusString, ctx.userId)]

    if (activeConfig.formData.instanceName === 'preprint2') {
      promises.push(importArticlesFromBiorxiv(groupId, ctx))
      promises.push(importArticlesFromPubmed(groupId, ctx))
    } else if (
      activeConfig.formData.instanceName === 'prc' &&
      shouldRunDefaultImportsForColab
    ) {
      promises.push(importArticlesFromBiorxivWithFullTextSearch(groupId, ctx))
    }

    if (!promises.length) return false

    Promise.all(promises)
      .catch(error => logger.error(error))
      .finally(async () => {
        subscriptionManager.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })
      })

    return true
  } finally {
    importsInProgress.delete(key)
  }
}

const importManuscriptsFromSemanticScholar = async (groupId, ctx) => {
  const key = `${groupId}-SemanticScholar`
  if (importsInProgress.has(key)) return false

  try {
    importsInProgress.add(key)

    const activeConfig = await Config.query().findOne({
      groupId,
      active: true,
    })

    const promises = []

    if (
      activeConfig.formData.integrations?.semanticScholar.enableSemanticScholar
    ) {
      promises.push(importArticlesFromSemanticScholar(groupId, ctx))
    }

    if (!promises.length) return false

    Promise.all(promises)
      .catch(error => logger.error(error))
      .finally(async () => {
        subscriptionManager.publish('IMPORT_MANUSCRIPTS_STATUS', {
          manuscriptsImportStatus: true,
        })
      })

    return true
  } finally {
    importsInProgress.delete(key)
  }
}

module.exports = {
  importManuscripts,
  importManuscriptsFromSemanticScholar,
}

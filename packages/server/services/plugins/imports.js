/* eslint-disable no-console, no-await-in-loop, no-plusplus */

const { uuid } = require('@coko/server')
const { chunk } = require('lodash')

const ArticleImportHistory = require('../../models/articleImportHistory/articleImportHistory.model')
const ArticleImportSources = require('../../models/articleImportSources/articleImportSources.model')
const Manuscript = require('../../models/manuscript/manuscript.model')

const importWorkersByGroup = {}

const flatten = items => {
  const result = []

  items.forEach(item => {
    if (Array.isArray(item)) {
      if (!item.length) return
      const parentId = uuid()
      result.push({ ...item[0], id: parentId, parentId: undefined })
      for (let i = 1; i < item.length; i++)
        result.push({ ...item[i], id: undefined, parentId })
    } else if (item)
      result.push({ ...item, id: undefined, parentId: undefined })
  })
  return result
}

const saveImportedManuscripts = async (
  allNewManuscripts,
  groupId,
  submitterId,
  options = {},
) => {
  const { trx } = options

  try {
    const firstVersions = allNewManuscripts.filter(x => !x.parentId)
    const laterVersions = allNewManuscripts.filter(x => x.parentId)

    // Save first version manuscripts in chunks of ten; then save the later versions one at a time so creation date preserves sequence
    const chunks = chunk(firstVersions, 10).concat(laterVersions.map(x => [x]))

    for (const ch of chunks) {
      await Manuscript.query(trx).upsertGraphAndFetch(ch, {
        relate: true,
        insertMissing: true,
      })
    }
  } catch (e) {
    console.error(e)
  }

  console.info(
    `Imported ${allNewManuscripts.length} manuscripts into group ${groupId} using plugins, with ${submitterId} as submitterId.`,
  )
}

const runImports = async (
  groupId,
  evaluatedStatusString,
  submitterId = null,
) => {
  const importType = submitterId ? 'manual' : 'automatic'
  const urisAlreadyImporting = []
  const doisAlreadyImporting = []
  const importWorkers = importWorkersByGroup[groupId] || []

  for (let i = 0; i < importWorkers.length; i += 1) {
    const worker = importWorkers[i]
    if (![importType, 'any'].includes(worker.importType)) continue

    console.info(`Importing manuscripts using plugin ${worker.name}`)
    let importSource, lastImportDate

    try {
      let [sourceRecord] = await ArticleImportSources.query().where({
        server: worker.name,
      })
      if (!sourceRecord)
        sourceRecord = await ArticleImportSources.query().insertAndFetch({
          server: worker.name,
        })
      importSource = sourceRecord.id

      const lastImportRecord = await ArticleImportHistory.query()
        .select('date')
        .findOne({ sourceId: importSource, groupId })

      lastImportDate = lastImportRecord ? lastImportRecord.date : null
    } catch (error) {
      console.error(
        `Failed to query sourceId and lastImportDate for plugin ${worker.name} on group ${groupId}. Skipping.`,
      )
      console.error(error)
      continue
    }

    let newItems

    try {
      newItems = await worker.doImport({
        urisAlreadyImporting: [...urisAlreadyImporting],
        doisAlreadyImporting: [...doisAlreadyImporting],
        lastImportDate: lastImportDate ? new Date(lastImportDate) : null,
      })
    } catch (error) {
      console.error(
        `Import plugin ${worker.name} failed on group ${groupId}. Skipping.`,
      )
      console.error(error)
      continue
    }

    if (!Array.isArray(newItems))
      throw new Error(
        `Expected ${worker.name} import function to return an array of manuscripts, but received ${newItems}`,
      )
    console.info(
      `Found ${newItems.length} new manuscripts for group ${groupId}.`,
    )

    const flattenedItems = flatten(newItems)

    const allNewManuscripts = flattenedItems.map(preprint => {
      const uri = preprint.submission.$sourceUri
      const doi = preprint.submission.$doi

      if (uri) urisAlreadyImporting.push(uri)
      if (doi) doisAlreadyImporting.push(doi)

      const result = {
        submission: {},
        importSourceServer: null,
        ...preprint,
        status: 'new',
        isImported: true,
        importSource,
        submitterId,
        files: [],
        teams: [],
        groupId,
      }

      if (!preprint.parentId) {
        result.channels = [
          {
            topic: 'Manuscript discussion',
            type: 'all',
            groupId,
          },
          {
            topic: 'Editorial discussion',
            type: 'editorial',
            groupId,
          },
        ]
      }

      if (
        Array.isArray(preprint.reviews) &&
        preprint.reviews.some(r => r.isDecision)
      )
        result.decision = evaluatedStatusString

      return result
    })

    console.log('Total items to save in DB => ', allNewManuscripts.length)

    // Rather than save inside a long-running transaction, we save what we can
    // and if there is a failure we simply don't update the article import
    // history to allow those manuscripts to be re-requested on next import
    // (rather than rolling all manuscripts back)
    saveImportedManuscripts(allNewManuscripts, groupId, submitterId, {})

    if (lastImportDate) {
      await ArticleImportHistory.query()
        .patch({ date: new Date().toISOString() })
        .where({ sourceId: importSource, groupId })
    } else {
      await ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId: importSource,
        groupId,
      })
    }
  }
}

module.exports = { runImports, importWorkersByGroup }

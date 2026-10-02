/* eslint-disable camelcase, consistent-return, no-console */
const axios = require('axios')

const ArticleImportHistory = require('../../models/articleImportHistory/articleImportHistory.model')
const Manuscript = require('../../models/manuscript/manuscript.model')

const { dateToIso8601 } = require('../../utils/dateUtils')

const {
  getServerId,
  getLastImportDate,
  getDate2WeeksAgo,
  getEmptySubmission,
  rawAbstractToSafeHtml,
} = require('./importTools')

const CURSOR_LIMIT = 200 // This permits up to 10,000 matches, but prevents infinite loop
const PAGES_PER_SAVE_BATCH = 20
const SAVE_CHUNK_SIZE = 50
const TIMEOUT_MS = 30000
const MAX_TRIES = 5
const DELAY_INCREMENT_MS = 10000

const doAxiosQueryWithRetry = async queryString => {
  for (let i = 0; i < MAX_TRIES; i += 1) {
    if (i > 0)
      // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
      await new Promise(resolve => setTimeout(resolve, i * DELAY_INCREMENT_MS))

    // eslint-disable-next-line no-await-in-loop
    const result = await axios
      .get(queryString, { timeout: TIMEOUT_MS })
      .then(response => {
        return response.data
      })
      .catch(error => {
        if (i >= MAX_TRIES - 1) throw error
        else
          console.error(
            `Attempt ${i + 1} of ${MAX_TRIES} to query bioRxiv failed: ${
              error.message
            }`,
          )

        return null
      })

    if (result) return result
  }
}

/** Generate a query to retrieve all manuscripts from biorxiv within the given date range.
 *  The generated query does not include the cursor parameter, which should be added.
 */
const formatSearchQueryWithoutCursor = (dateFrom, dateTo) => {
  const server = 'biorxiv'
  const importUrl = `https://api.biorxiv.org/fulltext?server=${server}&terms=""`
  return `${importUrl}&flag=any&date_from=${dateFrom}&date_to=${dateTo}`
}

const restrictToSubjects = (imports, subjects) =>
  imports.filter(preprint => subjects.includes(preprint.category))

const populateUrlAndAbstract = imports =>
  imports.map(item => ({
    ...item,
    url: `https://${item.server.toLowerCase()}.org/content/${item.doi}v${
      item.version
    }`,
    abstract: rawAbstractToSafeHtml(item.abstract),
  }))

/** Make sure we don't have multiple preprints sharing the same DOI in this batch of imports.
 * Where there are multiple versions of a preprint with the same DOI, keep only the latest.
 */
const stripInternalDuplicates = imports => {
  const importsByDoi = {}

  imports.forEach(preprint => {
    // If the preprint isn't a DOI duplicate, keep it.
    // If it's a DOI duplicate but a later version, keep it and discard the older version.
    const doiDuplicate = importsByDoi[preprint.doi]
    if (!doiDuplicate || preprint.version > doiDuplicate.version)
      importsByDoi[preprint.doi] = preprint
  })

  return Object.values(importsByDoi)
}

const buildNewManuscripts = (
  imports,
  groupId,
  ctx,
  sourceId,
  emptySubmission,
) =>
  imports.map(
    ({
      doi,
      title,
      author: authors,
      author_corresponding,
      author_corresponding_institution,
      abstract,
      date: datePublished,
      server: serverName,
      url,
    }) => ({
      status: 'new',
      isImported: true,
      importSource: sourceId,
      importSourceServer: serverName.toLowerCase(),
      submission: {
        ...emptySubmission,
        $title: title,
        firstAuthor: author_corresponding,
        $authors: authors
          .map(({ family, given }, index) => ({
            firstName: given,
            lastName: family,
            affiliation:
              index === 0 ? author_corresponding_institution : undefined,
          }))
          .filter(x => x.firstName || x.lastName),
        $abstract: abstract,
        datePublished: datePublished ? datePublished.replace(/-/g, '/') : null,
        journal: serverName,

        $sourceUri: url,
        $doi: doi,
      },
      meta: {},
      submitterId: ctx.userId,
      channels: [
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
      ],
      files: [],
      reviews: [],
      teams: [],
      groupId,
    }),
  )

/** Saves one batch of already-subject-filtered raw bioRxiv records: dedupes internal
 * version duplicates, skips DOIs already known (in the DB, or saved earlier in this
 * run), and inserts the rest in chunks. Adds the saved DOIs to `knownDois` so later
 * batches in the same run skip them too.
 */
const saveBatch = async (
  rawImports,
  groupId,
  ctx,
  sourceId,
  emptySubmission,
  knownDois,
) => {
  const deduped = stripInternalDuplicates(rawImports).filter(
    ({ doi }) => !knownDois.has(doi),
  )

  const imports = populateUrlAndAbstract(deduped)

  const newManuscripts = buildNewManuscripts(
    imports,
    groupId,
    ctx,
    sourceId,
    emptySubmission,
  )

  const result = []

  for (let i = 0; i < newManuscripts.length; i += SAVE_CHUNK_SIZE) {
    const chunk = newManuscripts.slice(i, i + SAVE_CHUNK_SIZE)
    // eslint-disable-next-line no-await-in-loop
    const inserted = await Manuscript.query().upsertGraphAndFetch(chunk, {
      relate: true,
    })
    Array.prototype.push.apply(result, inserted)
  }

  imports.forEach(({ doi }) => knownDois.add(doi))

  return result
}

const getData = async (groupId, ctx) => {
  const sourceId = await getServerId('biorxiv')
  const lastImportDate = await getLastImportDate(sourceId, groupId)
  const minDate = Math.max(lastImportDate, await getDate2WeeksAgo())
  const dateFrom = dateToIso8601(minDate)
  const dateTo = dateToIso8601(Date.now())

  const queryWithoutCursor = formatSearchQueryWithoutCursor(dateFrom, dateTo)
  const subjects = ['biophysics', 'biochemistry']
  const emptySubmission = getEmptySubmission(groupId)

  const { result: manuscripts } = await Manuscript.find({ groupId })

  const knownDois = new Set(
    manuscripts.map(m => m.submission.$doi).filter(Boolean),
  )

  console.log(`Requesting papers from biorxiv...`)

  const result = []
  let pageBuffer = []
  let totalRetrievedCount = 0
  let totalMatchedCount = 0
  let hadSaveError = false

  const flush = async () => {
    if (!pageBuffer.length) return
    const batch = pageBuffer
    pageBuffer = []

    try {
      const inserted = await saveBatch(
        batch,
        groupId,
        ctx,
        sourceId,
        emptySubmission,
        knownDois,
      )
      Array.prototype.push.apply(result, inserted)
    } catch (e) {
      hadSaveError = true
      console.error(e.message)
    }
  }

  for (let cursor = 0; cursor < CURSOR_LIMIT; cursor += 1) {
    const queryString = `${queryWithoutCursor}&cursor=${cursor}`
    // eslint-disable-next-line no-await-in-loop
    const data = await doAxiosQueryWithRetry(queryString)
    if (!data || !data.collection || !data.collection.length) break
    totalRetrievedCount += data.collection.length

    const matched = restrictToSubjects(data.collection, subjects)
    totalMatchedCount += matched.length
    pageBuffer.push(...matched)

    console.log(
      `Retrieved ${totalRetrievedCount} of ${data.total_results} total papers from biorxiv (${totalMatchedCount} in desired subjects)`,
    )

    if ((cursor + 1) % PAGES_PER_SAVE_BATCH === 0) {
      // eslint-disable-next-line no-await-in-loop
      await flush()
    }
  }

  await flush()

  // Only advance the import history if every batch saved cleanly, so a partial
  // failure doesn't cause this date range to be skipped on the next run.
  if (!hadSaveError) {
    if (lastImportDate) {
      await ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({ sourceId, groupId })
    } else {
      await ArticleImportHistory.insert({
        date: new Date().toISOString(),
        sourceId,
        groupId,
      })
    }
  }

  console.log(
    `Imported ${result.length} preprints from biorxiv (discarding duplicates).`,
  )

  return result
}

module.exports = getData

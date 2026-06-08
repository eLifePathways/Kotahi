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

const importAll = async (queryWithoutCursor, subjects) => {
  const imports = []
  let totalRetrievedCount = 0

  for (let cursor = 0; cursor < CURSOR_LIMIT; cursor += 1) {
    const queryString = `${queryWithoutCursor}&cursor=${cursor}`
    // eslint-disable-next-line no-await-in-loop
    const data = await doAxiosQueryWithRetry(queryString)
    if (!data || !data.collection || !data.collection.length) break
    totalRetrievedCount += data.collection.length
    imports.push(...restrictToSubjects(data.collection, subjects))
    console.log(
      `Retrieved ${totalRetrievedCount} of ${data.total_results} total papers from biorxiv (${imports.length} in desired subjects)`,
    )
    if (imports.length >= data.total_results) break
  }

  return imports
}

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

/** Strip any preprints that share a DOI with a manuscript already belonging to the group */
const stripDuplicates = async (imports, groupId) => {
  // TODO retrieving all manuscripts to check DOIs is inefficient!
  const manuscripts = await Manuscript.query().where({ groupId })

  const currentDois = new Set(
    manuscripts.map(m => m.submission.$doi).filter(Boolean),
  )

  return imports.filter(({ doi }) => !currentDois.has(doi))
}

const getData = async (groupId, ctx) => {
  const sourceId = await getServerId('biorxiv')
  const lastImportDate = await getLastImportDate(sourceId, groupId)
  const minDate = Math.max(lastImportDate, await getDate2WeeksAgo())
  const dateFrom = dateToIso8601(minDate)
  const dateTo = dateToIso8601(Date.now())

  const queryWithoutCursor = formatSearchQueryWithoutCursor(dateFrom, dateTo)

  console.log(`Requesting papers from biorxiv...`)
  let imports = await importAll(queryWithoutCursor, [
    'biophysics',
    'biochemistry',
  ])
  imports = stripInternalDuplicates(imports)
  imports = await stripDuplicates(imports, groupId)
  imports = populateUrlAndAbstract(imports)

  const emptySubmission = getEmptySubmission(groupId)

  const newManuscripts = imports.map(
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

  try {
    const result = []

    for (let i = 0; i < newManuscripts.length; i += SAVE_CHUNK_SIZE) {
      const chunk = newManuscripts.slice(i, i + SAVE_CHUNK_SIZE)

      // eslint-disable-next-line no-await-in-loop
      const inserted = await Manuscript.query().upsertGraphAndFetch(chunk, {
        relate: true,
      })

      Array.prototype.push.apply(result, inserted)
    }

    if (lastImportDate > 0) {
      await ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({ sourceId, groupId })
    } else {
      await ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId,
        groupId,
      })
    }

    console.log(
      `Imported ${result.length} preprints from biorxiv (discarding duplicates).`,
    )

    return result
  } catch (e) {
    console.error(e.message)
  }
}

module.exports = getData

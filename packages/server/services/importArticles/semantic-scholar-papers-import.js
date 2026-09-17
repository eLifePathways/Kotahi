/* eslint-disable no-console */

const axios = require('axios')

const ArticleImportHistory = require('../../models/articleImportHistory/articleImportHistory.model')
const ArticleImportSources = require('../../models/articleImportSources/articleImportSources.model')
const Manuscript = require('../../models/manuscript/manuscript.model')
const Config = require('../../models/config/config.model')

const {
  getLastImportDate,
  getEmptySubmission,
  rawAbstractToSafeHtml,
  rawTitleToSafeHtml,
} = require('./importTools')

const semanticScholarServers = require('./semanitc-scholar-servers.json')
const { getUrlByDoi } = require('../../utils/crossrefCommsUtils')

const SAVE_CHUNK_SIZE = 50
const TIMEOUT_MS = 30000

const getData = async (groupId, ctx) => {
  const activeConfig = await Config.getCached(groupId)

  const [checkIfSourceExists] = await ArticleImportSources.query().where({
    server: 'semantic-scholar',
  })

  if (!checkIfSourceExists) {
    await ArticleImportSources.query().insert({
      server: 'semantic-scholar',
    })
  }

  const [semanticScholarImportSourceId] =
    await ArticleImportSources.query().where({
      server: 'semantic-scholar',
    })

  const sourceId = semanticScholarImportSourceId.id

  const imports = []

  const lastImportDate = await getLastImportDate(sourceId, groupId)

  const manuscripts = await Manuscript.query()
    .where({ groupId })
    .orderBy('created', 'desc')

  const selectedManuscripts = manuscripts.filter(
    manuscript =>
      manuscript.submission.$customStatus && !manuscript.submission.isHidden,
  )

  const latestLimitedSelectedManuscripts = selectedManuscripts.slice(0, 100)

  console.log(
    `  Querying Semantic Scholar based on ${latestLimitedSelectedManuscripts.length} seed manuscripts...`,
  )

  if (latestLimitedSelectedManuscripts.length > 0) {
    const importDOIParams = latestLimitedSelectedManuscripts.map(manuscript => {
      const DOI = encodeURI(manuscript.submission.$doi)
      return `DOI:${DOI}`
    })

    const importParameters = JSON.stringify({
      positivePaperIds: importDOIParams,
      negativePaperIds: [],
    })

    const semanticSholarRequestUri =
      'https://api.semanticscholar.org/recommendations/v1/papers?limit=500&fields=url,venue,year,externalIds,title,abstract,authors,journal,publicationDate'

    const { data } = await axios.post(
      semanticSholarRequestUri,
      importParameters,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: TIMEOUT_MS,
      },
    )

    console.log(
      `  ${data?.recommendedPapers?.length} papers were recommended...`,
    )

    if (data) {
      Array.prototype.push.apply(imports, data.recommendedPapers)
    }

    const importsOnlyWithDOI = imports.filter(
      preprint => preprint.externalIds.DOI,
    )

    console.log(`  ${importsOnlyWithDOI.length} of these have DOIs...`)

    /* The following code is commented, since semantic scholar now provides journal and publication date as well. In case there is any inconsistency in that data, we can reuse the following */
    // await fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI)

    const recencyPeriodDays = Number(
      activeConfig.formData.integrations.semanticScholar
        .semanticScholarImportsRecencyPeriodDays ?? 0,
    )

    const recentImports = importsOnlyWithDOI.filter(preprint => {
      if (!recencyPeriodDays) return true

      if (preprint.publicationDate) {
        const currentDate = new Date().toISOString().split('T')[0]

        const diffDays = Math.floor(
          (Date.parse(currentDate.replace(/-/g, '/')) -
            Date.parse(preprint.publicationDate.replace(/-/g, '/'))) /
            (1000 * 60 * 60 * 24),
        )

        return diffDays < recencyPeriodDays
      }

      return false
    })

    console.log(
      `  ${
        recentImports.length
      } of these are within the configured recency period (${
        recencyPeriodDays ? `${recencyPeriodDays} days` : 'no limit'
      })`,
    )

    const currentDOIs = new Set(
      manuscripts.map(({ submission }) => submission.$doi),
    )

    const withoutDoiDuplicates = recentImports.filter(
      preprints => !currentDOIs.has(preprints.externalIds.DOI),
    )

    console.log(
      `  ${withoutDoiDuplicates.length} of these don't match DOIs already in Kotahi.`,
    )

    const withSourceUris = await Promise.all(
      withoutDoiDuplicates.map(async preprint => ({
        ...preprint,
        sourceUri: await getUrlByDoi(
          preprint.externalIds.DOI,
          activeConfig.formData.groupIdentity.contact,
        ),
      })),
    )

    const allowedPreprintServers =
      activeConfig.formData.integrations.semanticScholar
        .semanticScholarPublishingServers

    const allowedDomains = allowedPreprintServers
      .map(server => semanticScholarServers[server] ?? [])
      .flat()

    // Regex to match any of the given domains in a URL
    const domainsRegex = new RegExp(
      `^https?://[^/]*\\b(${allowedDomains
        .map(d => d.replaceAll('.', '\\.'))
        .join('|')})/`,
    )

    const importsFromSpecificPreprintServers = withSourceUris.filter(preprint =>
      domainsRegex.test(preprint.sourceUri ?? ''),
    )

    console.log(
      `  ${importsFromSpecificPreprintServers.length} of these are from the selected servers...`,
    )

    const currentUris = new Set(manuscripts.map(m => m.submission.$sourceUri))

    const withoutUriDuplicates = importsFromSpecificPreprintServers.filter(
      preprints => !currentUris.has(preprints.sourceUri),
    )

    console.log(
      `  ${withoutUriDuplicates.length} of these are new to this group.`,
    )

    const emptySubmission = getEmptySubmission(groupId)

    const newManuscripts = withoutUriDuplicates.map(
      ({
        title,
        authors,
        abstract,
        sourceUri,
        externalIds,
        publicationDate,
        venue,
      }) => ({
        status: 'new',
        isImported: true,
        importSource: sourceId,
        importSourceServer: 'semantic-scholar',
        submission: {
          ...emptySubmission,
          $title: rawTitleToSafeHtml(title),
          firstAuthor: authors[0] ? authors[0].name : '',
          $authors: authors.map(index => ({
            firstName: index.name.split(' ').slice(0, -1).join(' '),
            lastName: index.name.split(' ').slice(-1).join(' '),
          })),
          $abstract: rawAbstractToSafeHtml(abstract),
          datePublished: publicationDate,
          journal: venue,
          $sourceUri: sourceUri,
          $doi: externalIds?.DOI || '',
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

    if (!newManuscripts.length) return []

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

      console.log(
        `  Saved ${newManuscripts.length} papers from Semantic Scholar.`,
      )

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

      return result
    } catch (e) {
      console.error(e.message)
    }
  }

  return []
}

/* The following code is commented, since semantic scholar now provides journal and publication date as well. In case there is any inconsistency in that data, we can reuse the following */

// async function fetchPublicationDatesFromEuropePmc(importsOnlyWithDOI) {
//   await Promise.all(
//     map(importsOnlyWithDOI, async preprint => {
//       const queryDoi = `DOI:${preprint.externalIds.DOI}`

//       const params = {
//         query: queryDoi,
//         format: 'json',
//       }

//       let firstPublicationDate, preprintServer

//       try {
//         const response = await axios.get(
//           `https://www.ebi.ac.uk/europepmc/webservices/rest/search`,
//           {
//             params,
//           },
//         )

//         if (
//           response.data.resultList &&
//           response.data.resultList.result[0] &&
//           response.data.resultList.result[0].bookOrReportDetails
//         ) {
//           firstPublicationDate =
//             response.data.resultList.result[0].firstPublicationDate
//           preprintServer =
//             response.data.resultList.result[0].bookOrReportDetails.publisher
//         }

//         return Object.assign(preprint, { firstPublicationDate, preprintServer })
//       } catch (e) {
//         console.error(e.message)
//       }
//     }),
//   )
// }

module.exports = getData

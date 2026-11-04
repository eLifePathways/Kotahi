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

  const [checkIfSourceExists] = (
    await ArticleImportSources.find({
      server: 'semantic-scholar',
    })
  ).result

  if (!checkIfSourceExists) {
    await ArticleImportSources.insert({
      server: 'semantic-scholar',
    })
  }

  const [semanticScholarImportSourceId] = (
    await ArticleImportSources.find({
      server: 'semantic-scholar',
    })
  ).result

  const sourceId = semanticScholarImportSourceId.id

  const imports = []

  const lastImportDate = await getLastImportDate(sourceId, groupId)

  const { result: manuscripts } = await Manuscript.find(
    { groupId },
    { orderBy: [{ column: 'created', order: 'desc' }] },
  )

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
        groupId,
      }),
    )

    if (!newManuscripts.length) return []

    try {
      const result = []

      for (let i = 0; i < newManuscripts.length; i += SAVE_CHUNK_SIZE) {
        const chunk = newManuscripts.slice(i, i + SAVE_CHUNK_SIZE)

        // eslint-disable-next-line no-await-in-loop
        const inserted = await Promise.all(
          chunk.map(manuscript =>
            Manuscript.createNewManuscript(manuscript, {
              assignSubmitter: false,
            }),
          ),
        )

        Array.prototype.push.apply(result, inserted)
      }

      console.log(
        `  Saved ${newManuscripts.length} papers from Semantic Scholar.`,
      )

      if (lastImportDate > 0) {
        await ArticleImportHistory.patchBySourceAndGroup(sourceId, groupId, {
          date: new Date().toISOString(),
        })
      } else {
        await ArticleImportHistory.insert({
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

module.exports = getData

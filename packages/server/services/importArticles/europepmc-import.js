/* eslint-disable consistent-return */
const axios = require('axios')

const ArticleImportSources = require('../../models/articleImportSources/articleImportSources.model')
const ArticleImportHistory = require('../../models/articleImportHistory/articleImportHistory.model')
const Manuscript = require('../../models/manuscript/manuscript.model')

const { getSubmissionForm } = require('../../controllers/review.controllers')

// Not sure if this code is used anymore could not find any relevant import triggers for europepmc?
const getData = async (groupId, ctx) => {
  const dateTwoWeeksAgo =
    +new Date(new Date(Date.now()).toISOString().split('T')[0]) - 12096e5

  const [checkIfSourceExists] = await ArticleImportSources.query().where({
    server: 'europepmc',
  })

  if (!checkIfSourceExists) {
    await ArticleImportSources.query().insert({
      server: 'europepmc',
    })
  }

  const [europepmcImportSourceId] = await ArticleImportSources.query().where({
    server: 'europepmc',
  })

  const lastImportDate = await ArticleImportHistory.query()
    .select('date')
    .where({
      sourceId: europepmcImportSourceId.id,
      groupId,
    })

  const query =
    '(PUBLISHER:"bioRxiv" OR PUBLISHER:"medRxiv") AND ("membrane protein" OR "ion channel" OR "transporter" OR "pump" OR "gpcr" OR "G protein-coupled receptor" OR "exchanger" OR "uniporter" OR "symporter" OR "antiporter" OR "solute carrier" OR "atpase" OR "rhodopsin" OR "patch-clamp" OR "voltage-clamp" OR "single-channel")'

  const sort = 'P_PDATE_D desc'

  const format = 'json'

  const pageSize = 500

  const resultType = 'core'

  const requestUrl = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${query}&format=${format}&sort=${sort}&pageSize=${pageSize}&resultType=${resultType}`

  /* eslint-disable-next-line default-param-last */
  const requests = async (cursor = '', minDate, results = []) => {
    const { data } = await axios.get(`${requestUrl}&cursorMark=${cursor}`)

    const briefInfoAboutArticles = data.resultList.result

    const isDatesOutdated = briefInfoAboutArticles.some(
      ({ firstIndexDate }) => +new Date(firstIndexDate) < minDate,
    )

    if (isDatesOutdated) {
      const notOutdatedDates = briefInfoAboutArticles.filter(
        ({ firstIndexDate }) => +new Date(firstIndexDate) > minDate,
      )

      return results.concat(notOutdatedDates)
    }

    // return briefInfoAboutArticles
    return requests(
      data.nextCursorMark,
      minDate,
      results.concat(briefInfoAboutArticles),
    )
  }

  const date = lastImportDate.length ? lastImportDate[0].date : dateTwoWeeksAgo

  const importedManuscripts = await requests('', date, [])

  const submissionForm = await getSubmissionForm(groupId)

  const parsedFormStructure = submissionForm.structure.children
    .map(formElement => {
      const parsedName = formElement.name && formElement.name.split('.')[1]

      if (parsedName) {
        return {
          name: parsedName,
          component: formElement.component,
        }
      }

      return undefined
    })
    .filter(x => x !== undefined)

  const emptySubmission = parsedFormStructure.reduce((acc, curr) => {
    acc[curr.name] =
      curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
        ? []
        : ''
    return {
      ...acc,
    }
  }, {})

  const doiAndPublisher = importedManuscripts.map(article => {
    return { doi: article.doi, server: article.bookOrReportDetails.publisher }
  })

  const articlesDetailedInfoPromises = doiAndPublisher.map(
    ({ doi, server }) => {
      return axios
        .get(
          `https://api.biorxiv.org/details/${server.toLowerCase()}/${doi}/na/json`,
        )
        .then(response => response.data.collection[0])
    },
  )

  const articlesDetailedInfo = await Promise.all(articlesDetailedInfoPromises)

  const manuscripts = await Manuscript.query()

  const currentDOIs = manuscripts.map(({ submission }) => {
    return submission.doi
  })

  const withoutDuplicates = articlesDetailedInfo.filter(
    ({ doi }) => !currentDOIs.includes(`https://doi.org/${doi}`),
  )

  const newManuscripts = withoutDuplicates
    .map(
      ({
        doi,
        title,
        authors,
        abstract,
        version,
        date: datePublished,
        server,
      }) => {
        return {
          status: 'new',
          isImported: true,
          importSource: europepmcImportSourceId.id,
          importSourceServer: server.toLowerCase(),
          submission: {
            ...emptySubmission,
            $title: title,
            firstAuthor: authors,
            $abstract: abstract,
            datePublished: datePublished.replace(/-/g, '/'),
            journal: server,

            $sourceUri: `https://${server.toLowerCase()}.org/content/${doi}v${version}`,
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
        }
      },
    )
    .filter(Boolean)

  if (!newManuscripts.length) return []

  try {
    const inserted = await Manuscript.query().upsertGraphAndFetch(
      newManuscripts,
      { relate: true },
    )

    if (lastImportDate.length) {
      await ArticleImportHistory.query()
        .update({
          date: new Date().toISOString(),
        })
        .where({
          date: lastImportDate[0].date,
          groupId,
        })
    } else {
      await ArticleImportHistory.query().insert({
        date: new Date().toISOString(),
        sourceId: europepmcImportSourceId.id,
        groupId,
      })
    }

    return inserted
  } catch (e) {
    /* eslint-disable-next-line */
    console.error(e.message)
  }
}

module.exports = getData

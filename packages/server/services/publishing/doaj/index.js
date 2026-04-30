const axios = require('axios')
const { uuid } = require('@coko/server')
const Config = require('../../../models/config/config.model')

const { getSubmissionForm } = require('../../../controllers/review.controllers')

const checkIfRequiredFieldsArePublishable = (
  manuscript,
  submissionForm,
  fields,
) => {
  const fieldConfigurations = fields.map(fieldName =>
    submissionForm?.structure?.children.find(item => item.name === fieldName),
  )

  let shouldAllowPublish = true

  fieldConfigurations.forEach(field => {
    if (
      field?.permitPublishing !== 'always' &&
      (field?.permitPublishing !== 'true' ||
        !manuscript.formFieldsToPublish
          .find(ff => ff.objectId === manuscript.id)
          ?.fieldsToPublish?.includes(field.name))
    ) {
      shouldAllowPublish = false
    }
  })
  return shouldAllowPublish
}

const getIssueYear = manuscript => {
  let yearString = manuscript.submission.$issueYear
  if (typeof yearString !== 'string')
    throw new Error('Could not determine issue year')
  yearString = yearString.trim()

  // Only works for years 2000-2099
  if (!/^20\d\d$/.test(yearString))
    throw new Error(
      `Issue year '${yearString}' does not appear to be a valid year.`,
    )
  return yearString
}

const getContributor = author => {
  if (!author.firstName || !author.lastName)
    throw new Error(`Incomplete author record ${JSON.stringify(author)}`)

  const contributor = {
    name: `${author.lastName}, ${author.firstName}`,
    affiliation: author.affiliation || '',
    orcid: author.orcid_id || '',
  }

  if (author.affiliation)
    contributor.person_name.affiliation = author.affiliation
  return contributor
}

const requestToDOAJ = async (jsonRecords, activeConfig) => {
  const {
    formData: {
      publishing: { doaj },
    },
  } = activeConfig

  const { journalHomepage, registrant } = doaj

  const publishPromises = jsonRecords.map(async jsonRecord => {
    const formData = new FormData()
    formData.append('api_key', registrant)
    formData.append('article_json', JSON.stringify(jsonRecord))

    const doajUrl = `${journalHomepage}/api/articles/`

    const res = await axios.post(doajUrl, formData, {
      headers: formData.getHeaders(),
    })
    // eslint-disable-next-line
    console.log('Response from DOAJ')
    // eslint-disable-next-line
    console.log(res.data)
  })

  await Promise.all(publishPromises)
}

const publishToDOAJ = async manuscript => {
  // eslint-disable-next-line
  console.log('Publishing to DOAJ...')
  const activeConfig = await Config.getCached(manuscript.groupId)

  const {
    formData: { groupIdentity },
  } = activeConfig

  const { submission } = manuscript

  const { title: journalName } = groupIdentity

  const {
    $title,
    $abstract,
    $authors,
    $issueYear,
    $issueNumber,
    $volumeNumber,
  } = submission

  if (!submission) throw new Error('Manuscript has no submission object')
  if (!$title) throw new Error('Manuscript has no submission.$title')
  if (!$abstract) throw new Error('Manuscript has no submission.$abstract')
  if (!$authors) throw new Error('Manuscript has no submission.$authors field')
  if (!$issueYear)
    throw new Error('Manuscript has no submission.$issueYear field')
  if (!$issueNumber)
    throw new Error('Manuscript has no submission.$issueNumber field')
  if (!$volumeNumber)
    throw new Error('Manuscript has no submission.$volumeNumber field')
  if (!Array.isArray($authors))
    throw new Error('Manuscript.submission.$authors is not an array')

  if (!journalName) {
    throw new Error(`Journal Name should be defined`)
  }

  const submissionForm = await getSubmissionForm(manuscript.groupId)

  if (
    !checkIfRequiredFieldsArePublishable(manuscript, submissionForm, [
      'submission.$title',
      'submission.$abstract',
      'submission.$issueNumber',
      'submission.$issueYear',
      'submission.$volumeNumber',
    ])
  ) {
    throw new Error(
      `Check your submission form configuration as some required fields are not publishable`,
    )
  }

  const issueYear = getIssueYear(manuscript)
  const publishDate = new Date()

  const publishedLocation = `${activeConfig.formData.publishing.doaj.publishedArticleLocationPrefix}${manuscript.shortId}`
  const batchId = uuid()

  // Schema for this is here: https://doaj.github.io/doaj-docs/master/data_models/IncomingAPIArticle
  const now = new Date()

  const json = {
    admin: {
      in_doaj: true,
      publisher_record_id: activeConfig.formData.publishing.doaj.doajRegistrant,
      seal: true,
      upload_id: batchId,
    },
    bibjson: {
      abstract: manuscript.submission.$abstract,
      author: manuscript.submission.$authors.map(
        (author, i) => getContributor(author, i).person_name,
      ),

      identifier: [
        {
          id: manuscript.shortId,
          type: 'string',
        },
      ],
      journal: {
        country: activeConfig.formData.doaj.country,
        end_page: '',
        language: [activeConfig.formData.publishing.doaj.language],
        number: manuscript.submission?.issueNumber || '',
        publisher: activeConfig.formData.groupIdentity.brandName,
        start_page: '',
        title: activeConfig.formData.groupIdentity.title,
        volume: manuscript.submission?.volumeNumber || '',
      },
      keywords: manuscript.submission?.topics || [],
      link: [
        {
          content_type: 'text/html',
          type: 'fulltext',
          url: publishedLocation,
        },
      ],
      month: publishDate.getUTCMonth() + 1,
      // subject: [
      //   {
      //     code: '', // DOAJ should create these automatically, leaving in for future
      //     scheme: '',
      //     term: '',
      //   },
      // ],
      title: manuscript.submission.$title,
      year: issueYear,
    },
    created_date: now,
    es_type: 'string',
    // id: '', // DOAJ should create this automatically, leaving in for future
    last_updated: now,
  }

  await requestToDOAJ([json], activeConfig)
}

module.exports = {
  publishToDOAJ,
}

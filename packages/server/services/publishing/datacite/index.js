const axios = require('axios')
const { logger } = require('@coko/server')
const Config = require('../../../models/config/config.model')

const { ERROR_MESSAGES } = require('./constants')

const {
  getContributor,
  getPublisher,
  getContributors,
  getDescriptions,
  getRightsList,
  getFundingReferences,
  getRelatedIdentifiers,
  getDates,
} = require('./fieldsTransformers')

const { getDoi, getDataciteURL, getDoiWithoutError } = require('./utils')

const { isArray } = Array

/** Returns true if a DOI is not already in use.
 * It will also return true if the Datacite server is faulty or down, so that form submission is not prevented.
 */
const doiIsAvailable = async (checkDOI, activeConfig) => {
  try {
    // Try to find object listed at DOI
    await requestToDatacite('get', `dois/${checkDOI}`, null, activeConfig)

    // eslint-disable-next-line no-console
    console.log(
      `DOI '${checkDOI}' is already taken. Custom suffix is unavailable.`,
    )
    return false // DOI is already in use
  } catch (err) {
    if (err.response.status === 404) {
      // HTTP 404 "Not found" response. The DOI is not known by Datacite
      return true
    }

    return true
  }
}

const verifySubmission = (formData, submission) => {
  const {
    publishing: { datacite },
    groupIdentity: { title },
  } = formData

  const { doiPrefix, publishedArticleLocationPrefix: locationPrefix } = datacite
  const errors = []
  if (!doiPrefix) errors.push(ERROR_MESSAGES.noDoiPrefix)
  if (!title) errors.push(ERROR_MESSAGES.noJournalName)
  if (!locationPrefix) errors.push(ERROR_MESSAGES.noArticleLocationPrefix)
  if (!submission) errors.push(ERROR_MESSAGES.noSubmissionObject)

  const { $title, $authors /* resourcetype */ } = submission || {}
  const noAuthors = !isArray($authors) || !$authors.length

  if (!$title) errors.push(ERROR_MESSAGES.noSubmissionTitle)
  if (noAuthors) errors.push(ERROR_MESSAGES.noSubmissionAuthors)
  // if (!resourcetype) return ERROR_MESSAGES.noResourceType // disabled (we will set 'other' as default)

  return errors.length > 0 && errors
}

const getPathAndPayload = async (manuscript, activeConfig) => {
  const { id, shortId, meta, submission } = manuscript

  const {
    $localContext,
    geolocation,
    $abstract,
    $authors,
    $dois,
    $doi,
    $issueYear: issueYear,
    resourcetype: resourceTypeGeneral = 'Other',
    ifother: resourceType = 'project',
    $title: title,
  } = submission

  const { formData } = activeConfig
  const { datacite } = formData.publishing
  const { doiPrefix: prefix, publishedArticleLocationPrefix } = datacite

  let suffix = id

  if ($doi) {
    const [, extractedSuffix] = $doi.match(/10\.\d{4,9}\/(.+)$/i) || []

    if (extractedSuffix) {
      suffix = extractedSuffix
    }
  }

  const doi = getDoi(suffix, activeConfig)
  const publishDate = new Date()

  const doiAvailable = await doiIsAvailable(doi, activeConfig)
  const path = doiAvailable ? 'dois' : `dois/${doi}`
  const method = doiAvailable ? 'post' : 'put'

  const payload = {
    type: 'dois',
    attributes: {
      doi,
      event: 'publish',
      prefix,
      suffix,
      url: `${publishedArticleLocationPrefix}${shortId}`,
      types: { resourceTypeGeneral, resourceType },
      titles: title ? [{ title }] : [],
      creators: $authors?.map(getContributor) ?? [],
      geoLocations: geolocation ? [{ geoLocationPlace: geolocation }] : [],
      publicationYear: publishDate.getUTCFullYear(),
      publisher: getPublisher(formData),
      contributors: getContributors(formData),
      descriptions: getDescriptions($abstract),
      rightsList: getRightsList($localContext),
      fundingReferences: getFundingReferences(submission),
      relatedIdentifiers: getRelatedIdentifiers(meta, $dois),
      dates: getDates(issueYear, publishDate),
      // relatedItems: getRelatedItems(submission, formData),
    },
  }

  return { payload, path, method }
}

const requestToDatacite = (method, path, payload, { formData }) => {
  const { useSandbox, login, password } = formData.publishing.datacite

  const url = getDataciteURL(useSandbox)

  const auth = Buffer.from(`${login}:${password}`).toString('base64')
  const authorization = `Basic ${auth}`

  const options = {
    method,
    url: `${url}/${path}`,
    headers: {
      accept: 'application/vnd.api+json',
      authorization,
    },
    data: {
      data: payload,
    },
  }

  return axios.request(options)
}

const publishToDatacite = async manuscript => {
  const { submission, groupId } = manuscript
  const activeConfig = await Config.getCached(groupId)
  const { formData } = activeConfig

  const failureReason = verifySubmission(formData, submission)
  if (failureReason) throw new Error(failureReason[0]) // keep throwing first err

  const { payload, path, method } = await getPathAndPayload(
    manuscript,
    activeConfig,
  )

  logger.info(`SERVICES: publishToDatacite payload: ${JSON.stringify(payload)}`)

  const {
    data: { data },
  } = await requestToDatacite(method, path, payload, activeConfig)

  const { doi } = data.attributes

  return doi
}

const checkPayload = async (manuscript, activeConfig) => {
  const { id: suffix, shortId, meta, submission } = manuscript

  const {
    $localContext,
    geolocation,
    $abstract,
    $authors,
    $dois,
    $issueYear: issueYear,
    objectType: resourceTypeGeneral = 'Other',
    ifother: resourceType = 'project',
    $title: title,
  } = submission

  const { formData } = activeConfig
  const { datacite } = formData.publishing
  const { doiPrefix: prefix, publishedArticleLocationPrefix } = datacite

  const failureReason = []
  const submissionErrors = verifySubmission(formData, submission)
  if (submissionErrors) failureReason.concat(submissionErrors)

  const doi = getDoiWithoutError(suffix, activeConfig)
  const publishDate = new Date()

  const payload = {
    type: 'dois',
    attributes: {
      doi,
      event: 'publish',
      prefix,
      suffix,
      url: `${publishedArticleLocationPrefix}${shortId}`,
      types: { resourceTypeGeneral, resourceType },
      titles: title ? [{ title }] : [],
      creators: $authors?.map(getContributor) ?? [],
      geoLocations: geolocation ? [{ geoLocationPlace: geolocation }] : [],
      publicationYear: publishDate.getUTCFullYear(),
      publisher: getPublisher(formData),
      contributors: getContributors(formData),
      descriptions: getDescriptions($abstract),
      rightsList: getRightsList($localContext),
      fundingReferences: getFundingReferences(submission),
      relatedIdentifiers: getRelatedIdentifiers(meta, $dois),
      dates: getDates(issueYear, publishDate),
      // relatedItems: getRelatedItems(submission, formData),
    },
  }

  return { payload }
}

module.exports = {
  publishToDatacite,
  getDoi,
  doiIsAvailable,
  verifySubmission,
  checkPayload,
}

const axios = require('axios')
const { File, fileStorage, logger, config } = require('@coko/server')

const htmlToJats = require('../../jatsexport/htmlToJats')

const {
  getContributor,
  getLicenses,
  getFundingReferences,
  getFormattedFiles,
} = require('./fieldsTransformers')

const getAdaURL = useSandbox => {
  return useSandbox
    ? 'https://archive-uat.astromat.org'
    : 'https://archive.astromat.org'
}

const requestToAda = (method, path, payload) => {
  const url = getAdaURL(true)

  if (!config.has('adaKey')) {
    throw new Error(
      'Cannot publish to Astromat ADA. ADA Key is missing in the environment variables',
    )
  }

  const Authorization = `Api-Key ${config.get('adaKey')}`

  const options = {
    method,
    url: `${url}/${path}`,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization,
    },
  }

  if (payload) {
    options.data = payload
  }

  return axios.request(options)
}

const getPayload = async (
  { id: manuscriptId, parentId, submission },
  doiStatus,
  currentProcessStatus = 'Processed',
) => {
  const {
    adaProcessStatus,
    adaState,
    contributors,
    $abstract,
    $authors,
    generalType,
    specificType,
    $title: title,
  } = submission

  let payload = {
    creators: $authors?.map(getContributor(false)) ?? [],
    title,
    submissionType: 'Regular',
  }

  if (!doiStatus) {
    return payload
  }

  if (doiStatus === 'process') {
    return {}
  }

  if (doiStatus === 'findable') {
    return currentProcessStatus === 'Processed'
      ? {
          processStatus: 'Calibration and Validation',
        }
      : { doiStatus }
  }

  const processStatus = adaProcessStatus

  if (doiStatus === 'publish') {
    return { processStatus: 'Published' }
  }

  let processPath = ''

  const manuscriptFiles = await File.query().where({ objectId: manuscriptId })

  if (manuscriptFiles.length) {
    processPath = `${manuscriptFiles[0].meta.bucket || fileStorage.bucket}/${
      parentId || manuscriptId
    }`
  }

  payload = {
    ...payload,
    contributors: contributors?.map(getContributor(true)) ?? [],
    description: $abstract ? htmlToJats($abstract) : null,
    files: getFormattedFiles(manuscriptFiles),
    funding: getFundingReferences(submission),
    licenses: getLicenses(submission),
    fundingDescription: submission.fundingDescription || null,
    generalType,
    specificType,
    publicationDate: new Date().toISOString(),
    processPath,
  }

  if (processStatus !== adaProcessStatus) {
    payload.processStatus = processStatus
  }

  if (adaState && doiStatus !== adaState) {
    payload.doiStatus = doiStatus
  }

  return payload
}

const publishToAda = async (manuscript, newAdaState = 'draft') => {
  const {
    submission: {
      $doi = null,
      adaId = null,
      adaJobDetails = null,
      adaJobId = null,
      adaJobStatus = null,
      adaProcessStatus = null,
      adaState: oldAdaState = null,
    },
  } = manuscript

  let method = 'POST'
  let path = 'api/record/'

  let payload = await getPayload(manuscript, null)

  let response = {
    adaState: newAdaState,
    adaProcessStatus,
    doi: $doi,
    adaId,
    adaJobId,
    adaJobDetails,
    adaJobStatus,
  }

  if (!oldAdaState && newAdaState === 'draft') {
    const { data: draftData } = await requestToAda(method, path, payload)
    const { doi, doiStatus, id, processStatus } = draftData

    response = {
      ...response,
      adaId: id,
      doi,
      doiStatus,
      adaProcessStatus: processStatus,
    }
  }

  if (oldAdaState === 'draft' && newAdaState === 'process' && adaId) {
    method = 'PATCH'
    path = `api/record/${$doi}`
    payload = await getPayload(manuscript, oldAdaState)

    await requestToAda(method, path, payload)

    method = 'POST'
    path = `api/process/${adaId}`
    payload = await getPayload(manuscript, newAdaState)

    const { data: processData } = await requestToAda(method, path, payload)

    const { jobId } = processData

    response = { ...response, adaJobId: jobId }
  }

  if (
    oldAdaState === 'process' &&
    newAdaState === 'findable' &&
    adaProcessStatus === 'Processed'
  ) {
    method = 'PATCH'
    path = `api/record/${$doi}`
    payload = await getPayload(manuscript, newAdaState, adaProcessStatus)

    const { data: calibPatchData } = await requestToAda(method, path, payload)

    const { processStatus } = calibPatchData
    payload = await getPayload(manuscript, newAdaState, processStatus)

    const { data: findablePatchData } = await requestToAda(
      method,
      path,
      payload,
    )

    const { doiStatus } = findablePatchData

    response = {
      ...response,
      adaState: doiStatus,
      adaProcessStatus: processStatus,
    }
  }

  if (
    oldAdaState === 'findable' &&
    newAdaState === 'publish' &&
    adaProcessStatus === 'Calibration and Validation'
  ) {
    method = 'PATCH'
    path = `api/record/${$doi}`
    payload = await getPayload(manuscript, newAdaState)

    const { data: publishData } = await requestToAda(method, path, payload)

    const { processStatus } = publishData

    response = { ...response, adaProcessStatus: processStatus }
  }

  logger.info('ADA payload', JSON.stringify(payload))

  return response
}

const getAdaJobStatus = async submission => {
  const {
    $doi = null,
    adaJobId = null,
    adaProcessStatus: oldAdaProcessStatus = null,
  } = submission

  let adaProcessStatus = oldAdaProcessStatus

  const method = 'GET'
  let path = `api/job/${adaJobId}`

  const { data: jobData } = await requestToAda(method, path, {})

  if (jobData.jobStatus === 'Succeeded') {
    path = `api/record/${$doi}`

    const { data: recordData } = await requestToAda(method, path, {})

    adaProcessStatus = recordData.processStatus
  }

  return {
    adaJobDetails: jobData.jobDetails,
    adaJobStatus: jobData.jobStatus,
    adaProcessStatus,
  }
}

module.exports = {
  publishToAda,
  getAdaJobStatus,
}

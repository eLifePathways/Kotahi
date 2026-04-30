const { config } = require('@coko/server')

const { clientUrl, serverUrl, request, uuid, logger } = require('@coko/server')

const {
  Config,
  Group,
  Identity,
  Review,
  CoarNotification,
} = require('../../models')

const flaxConfig = config.get('flax-site')

// TODO: What is the purpose of this?
const isReviewDoi = () => {
  return false
}

const isFlaxSetup = () => {
  return (
    flaxConfig.port !== '' &&
    flaxConfig.host !== '' &&
    flaxConfig.protocol !== ''
  )
}

const getFlaxUrl = async (groupName, shortId) => {
  let flaxReviewUrl = ''
  let flaxUrl = ''

  if (!flaxConfig) return { flaxReviewUrl, flaxUrl }
  const flaxHost = flaxConfig.host
  const flaxPort = flaxConfig.port
  const flaxProtocol = flaxConfig.protocol

  const flaxServerUrl = `${flaxProtocol}://${flaxHost}${
    flaxPort ? `:${flaxPort}` : ''
  }`

  flaxReviewUrl = `${flaxServerUrl}/${groupName}/articles/${shortId}/index.html#reviews`
  flaxUrl = `${flaxServerUrl}/${groupName}/articles/${shortId}/index.html`

  return { flaxReviewUrl, flaxUrl }
}

const getDoi = manuscript => {
  if (manuscript.doi.includes('doi.org')) {
    return manuscript.doi
  }

  return `https://doi.org/${manuscript.doi}`
}

const generateUrn = () => `urn:uuid:${uuid()}`

const getRequestData = async (
  notification,
  manuscript,
  announcementType,
  options = {},
) => {
  const { payload, groupId } = notification
  const { endorsement, linkedResource } = options
  const group = await Group.query().findById(groupId).first()
  const reviewer = await getReviewer(manuscript)

  const { flaxReviewUrl, flaxUrl } = await getFlaxUrl(
    group.name,
    manuscript.shortId,
  )

  const announcementTypes = {
    endorsement: 'Endorsement',
    relationship: 'Relationship',
    review: 'Review',
  }

  const type = [
    'Announce',
    `coar-notify:${announcementTypes[announcementType]}Action`,
  ]

  // default to review
  let object = {
    id: reviewer ? flaxReviewUrl : flaxUrl,
    type: ['Document', 'sorg:Review'],
    ...(reviewer ? { 'ietf:cite-as': flaxReviewUrl } : {}),
  }

  let context = {
    id: getDoi(manuscript),
    type: ['Document', 'sorg:AboutPage'],
    'ietf:cite-as': getDoi(manuscript),
  }

  if (announcementType === 'endorsement') {
    const id = generateUrn()
    object = {
      id,
      type: ['Note', 'sorg:WebPage'],
      content: endorsement,
      //   'ietf:cite-as': flaxUrl ?? id,
    }
  }

  if (announcementType === 'relationship') {
    context = {
      ...context,
      id: linkedResource,
    }

    object = {
      id: generateUrn(),
      type: ['Relationship'],
      'as:subject': flaxUrl,
      'as:relationship': 'https://schema.org/relatedTo',
      'as:object': linkedResource,
    }
  }

  const defaultPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    id: generateUrn(),
    updated: new Date().toISOString(),
    type,
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...payload.origin,
    },
    object,
    actor: {
      type: 'Person',
      id: '',
      name: 'Anonymous',
    },
    context,
    inReplyTo: payload.id,
  }

  if (reviewer && announcementType === 'review') {
    defaultPayload.actor = {
      type: 'Person',
      id: reviewer.orcid
        ? `https://orcid.org/${reviewer.orcid}`
        : reviewer.email,
      name: reviewer.username,
    }
  } else if (['endorsement', 'relationship'].includes(announcementType)) {
    const { formData } = await Config.getCached(groupId)
    defaultPayload.actor = {
      type: 'Organization',
      id: clientUrl,
      name: formData.groupIdentity.title,
    }
  }

  return JSON.stringify(defaultPayload)
}

const getReviewer = async manuscript => {
  const manuscriptId = manuscript.id

  const latestReview = await Review.query()
    .findOne({ manuscriptId, is_decision: false })
    .orderBy('updated', 'desc')
    .first()

  if (!latestReview || latestReview.isHiddenReviewerName) {
    return null
  }

  const reviewer = await latestReview.$relatedQuery('user')

  const identity = await Identity.findOne({
    userId: reviewer.id,
    type: 'orcid',
  })

  return { ...reviewer, orcid: identity?.identifier }
}

const makeAnnouncementOnCOAR = async (
  notification,
  manuscript,
  type,
  options,
) => {
  const requestData = await getRequestData(
    notification,
    manuscript,
    type,
    options,
  )

  const payload = JSON.parse(requestData)

  const inboxUrl = payload.target.inbox
  const requestLength = requestData.length

  if (!isReviewDoi() && !isFlaxSetup() && type === 'review') {
    return false
  }

  try {
    const response = await request({
      method: 'post',
      url: inboxUrl,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${requestLength}`,
      },
      data: requestData,
    })

    const { groupId, id: manuscriptId } = manuscript

    await CoarNotification.query().insert({ groupId, manuscriptId, payload })

    return response?.data || false
  } catch (err) {
    logger.error(err)
    throw err
  }
}

module.exports = {
  isFlaxSetup,
  isReviewDoi,
  generateUrn,
  getFlaxUrl,
  getReviewer,
  makeAnnouncementOnCOAR,
}

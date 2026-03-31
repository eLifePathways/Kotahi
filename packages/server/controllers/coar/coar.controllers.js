const { get } = require('lodash')
const { logger, serverUrl, request } = require('@coko/server')
const { getCrossrefDataViaDoi } = require('./crossRef')
const { getDataciteViaDoi } = require('./dataCite')
const { makeAnnouncementOnCOAR, generateUrn } = require('./announcement')

const {
  CoarNotification,
  Config,
  Group,
  Manuscript,
  User,
} = require('../../models')

const { getSubmissionForm } = require('../review.controllers')

let archiveManuscript
setImmediate(() => {
  /* eslint-disable global-require */
  archiveManuscript =
    require('../manuscript/manuscript.controllers').archiveManuscript
  /* eslint-enable global-require */
})

const supportedDoiRegistrationAgencies = ['Crossref', 'DataCite']
const raUrl = 'https://doi.org/doiRA'

const getDoiRegistrationAgency = async doi => {
  try {
    const { data } = await request({ method: 'get', url: `${raUrl}/${doi}` })

    if (Array.isArray(data)) {
      const [{ RA, status }] = data

      return RA ?? status
    }

    const { RA, status } = data
    return RA ?? status
  } catch (error) {
    console.error(`Failed to find RA for DOI ${doi}`)
    return error.message
  }
}

const sendAnnouncementNotification = (
  notification,
  manuscript,
  type,
  options,
) => {
  return makeAnnouncementOnCOAR(notification, manuscript, type, options)
}

const sendTentativeAcceptCoarNotification = async (
  manuscript,
  handlingEditorIds,
) => {
  const offerNotification =
    await CoarNotification.getOfferNotificationForManuscript(manuscript.id)

  if (!offerNotification) {
    logger.error(
      'COAR: sendTentativeAcceptNotification: no notification found for manuscript',
      manuscript.id,
    )
    return false
  }

  const handlingEditor = await User.findOneWithIdentity(
    handlingEditorIds[0],
    'orcid',
  )

  handlingEditor.orcid = handlingEditor.identities[0]?.identifier

  const group = await Group.findById(manuscript.groupId)

  const { payload: offerPayload } = offerNotification

  const tentativeAcceptObject = { ...offerPayload }
  delete tentativeAcceptObject['@context']

  const tentativeAcceptPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor: {
      id: handlingEditor.orcid
        ? `https://orcid.org/${handlingEditor.orcid}`
        : handlingEditor.email,
      type: 'Person',
      name: handlingEditor.username,
    },
    id: generateUrn(),
    inReplyTo: offerPayload.id,
    object: tentativeAcceptObject,
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...offerPayload.origin,
    },
    type: 'TentativeAccept',
  }

  const stringifiedPayload = JSON.stringify(tentativeAcceptPayload)

  try {
    const response = await request({
      method: 'post',
      url: tentativeAcceptPayload.target.inbox,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${stringifiedPayload.length}`,
      },
      data: stringifiedPayload,
    })

    await createNotification(tentativeAcceptPayload, group.id, manuscript.id)

    return response ? response.data : false
  } catch (e) {
    logger.error(e)
    return false
  }
}

const sendRejectCoarNotification = async (
  manuscript,
  editor,
  decision = 'rejected',
) => {
  const offerNotification =
    await CoarNotification.getOfferNotificationForManuscript(manuscript.id)

  if (!offerNotification) {
    logger.error(
      'COAR: sendTentativeAcceptNotification: no notification found for manuscript',
      manuscript.id,
    )
    return false
  }

  const group = await Group.findById(manuscript.groupId)
  const { payload: offerPayload } = offerNotification

  const actor = {
    id: '',
    type: 'Person',
    name: 'Anonymous',
  }

  if (editor) {
    const actorId = editor.identities[0]?.identifier
      ? `https://orcid.org/${editor.identities[0].identifier}`
      : editor.email

    actor.id = actorId
    actor.name = editor.username
  }

  const rejectObject = { ...offerPayload }
  delete rejectObject['@context']

  const rejectPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor,
    id: generateUrn(),
    inReplyTo: offerPayload.id,
    object: rejectObject,
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      ...offerPayload.origin,
    },
    type: decision === 'revise' ? 'TentativeReject' : 'Reject',
  }

  const stringifiedPayload = JSON.stringify(rejectPayload)

  try {
    const response = await request({
      method: 'post',
      url: rejectPayload.target.inbox,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${stringifiedPayload.length}`,
      },
      data: stringifiedPayload,
    })

    await createNotification(rejectPayload, group.id, manuscript.id)

    return response ? response.data : false
  } catch (e) {
    logger.error(e)
    return false
  }
}

const sendUnprocessableCoarNotification = async (
  reason,
  originalPayload = {},
  manuscriptId = null,
  groupId = null,
) => {
  const { id: notificationId, origin, target } = originalPayload

  const payload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor: {
      id: 'https://kotahi.community',
      type: 'Organization',
      name: 'Kotahi',
    },
    id: generateUrn(),
    inReplyTo: notificationId,
    object: {
      id: notificationId,
    },
    origin: {
      id: serverUrl,
      type: 'Service',
      ...(target?.inbox ? { inbox: target.inbox } : {}),
    },
    summary: reason,
    target: {
      ...origin,
    },
    type: ['Flag', 'coar-notify:UnprocessableNotification'],
  }

  const stringifiedPayload = JSON.stringify(payload)

  try {
    const response = await request({
      method: 'post',
      url: payload.target.inbox,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': `${stringifiedPayload.length}`,
      },
      data: stringifiedPayload,
    })

    if (manuscriptId) {
      await CoarNotification.query().insert({ payload, manuscriptId, groupId })
    }

    return response ? response.data : false
  } catch (e) {
    logger.error(e)
    return false
  }
}

const createNotification = async (payload, groupId, manuscriptId = null) => {
  const notification = await CoarNotification.query().insert({
    payload,
    groupId,
    ...(manuscriptId ? { manuscriptId } : {}),
  })

  return notification
}

const getManuscriptByDoi = async (doi, groupId) => {
  const manuscript = await Manuscript.findOne({ doi, groupId, isHidden: false })
  return manuscript
}

const getAdditionalMetadata = async (data, groupId) => {
  const submissionForm = await getSubmissionForm(groupId)

  const mappedMetadata = submissionForm.structure.children
    .filter(e => !!e.metadataMapping)
    .reduce((acc, e) => {
      const parsedName = e.name && e.name.split('.')[1]
      if (!parsedName) return acc

      acc[parsedName] = get(data, e.metadataMapping)
      return acc
    }, {})

  return mappedMetadata
}

const extractManuscriptFromNotification = async (payload, groupId, doiRa) => {
  const doi = extractDoi(payload)

  const doiMetadata =
    doiRa === 'Crossref'
      ? await getCrossrefDataViaDoi(doi)
      : await getDataciteViaDoi(doi)

  //   const crossrefData = await getCrossrefDataViaDoi(doi)
  const existingManuscript = await getManuscriptByDoi(doi, groupId)

  if (existingManuscript) return null

  if (!doiMetadata) {
    throw new Error(
      `Could not find metadata for DOI ${doi}. Please verify with ${doiRa}`,
    )
  }

  const {
    title,
    topics,
    publishedDate,
    abstract,
    journal,
    author,
    $authors,
    url,
    data: rawDoiData,
  } = doiMetadata

  const additionalMappedMetadata = await getAdditionalMetadata(
    rawDoiData,
    groupId,
  )

  const newManuscript = {
    submission: {
      datePublished: publishedDate,
      $abstract: abstract || '',
      firstAuthor: author,
      journal,
      topics,
      $doi: doi,
      url,
      $title: title,
      $authors,
      ...additionalMappedMetadata,
    },
    status: 'new',
    meta: {
      title,
    },
    importSourceServer: 'COAR',
    groupId,
    doi,
    // Create two channels: 1. free for all involved, 2. editorial
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
  }

  const manuscript = await Manuscript.query().upsertGraphAndFetch(
    newManuscript,
    { relate: true },
  )

  return manuscript
}

const validateIPs = async (requestIP, group) => {
  const groupId = group.id

  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const coarNotifyFormData = activeConfig.formData.integrations.coarNotify
  let repoIpAddress = '*'

  if (coarNotifyFormData) {
    repoIpAddress = coarNotifyFormData.repoIpAddress
  }

  if (!repoIpAddress || repoIpAddress === '*') {
    return true
  }

  const acceptedIPs = repoIpAddress.split(',').map(ip => ip.trim())

  return acceptedIPs.includes(requestIP)
}

const linkManuscriptToNotification = async (notification, manuscript) => {
  const manuscriptId = manuscript.id
  await CoarNotification.query()
    .findById(notification.id)
    .patch({ manuscriptId })
}

const extractDoi = payload => {
  const doi = payload.object && payload.object['ietf:cite-as']
  return doi ? doi.replace(/^https?:\/\/(dx\.)?doi\.org\//i, '') : null
}

const extractNotificationType = payload => {
  if (Array.isArray(payload?.type)) {
    if (payload.type.includes('Offer')) {
      return 'Offer'
    }

    if (payload.type.includes('Undo')) {
      return 'Undo'
    }
  }

  if (payload?.type === 'Undo') {
    return 'Undo'
  }

  return null
}

const processNotification = async (group, payload) => {
  const groupId = group.id
  const doi = extractDoi(payload)

  const type = extractNotificationType(payload)

  if (!type) {
    return { status: 400, message: 'Invalid notification type' }
  }

  if (type === 'Undo' && !payload.inReplyTo) {
    return {
      status: 400,
      message: 'Property `inReplyTo` is missing from payload',
    }
  }

  const existingNotification =
    await CoarNotification.getOfferNotificationForGroupByIdOrDoi(
      groupId,
      type === 'Undo' ? payload.inReplyTo : payload.id,
      doi,
    )

  if (type === 'Undo') {
    if (!existingNotification) {
      return { status: 404, message: 'Notification not found' }
    }

    const existingManuscript = await Manuscript.findById(
      existingNotification.manuscriptId,
    )

    if (!existingManuscript || existingManuscript.isHidden) {
      return { status: 404, message: 'Manuscript not found' }
    }

    await createNotification(payload, groupId, existingManuscript.id)
    await archiveManuscript(existingManuscript.id)

    return { status: 202, message: 'Manuscript archived successfully' }
  }

  if (existingNotification) {
    return {
      status: 400,
      message: 'Notification already exists with the same payload.',
    }
  }

  // may contain the error message to be returned
  const doiRa = await getDoiRegistrationAgency(doi)

  if (!supportedDoiRegistrationAgencies.includes(doiRa)) {
    return { status: 400, message: doiRa }
  }

  let newManuscript

  try {
    // only returns a new manuscipt, else null for existing
    newManuscript = await extractManuscriptFromNotification(
      payload,
      groupId,
      doiRa,
    )
  } catch (extractError) {
    return { status: 400, message: extractError.message }
  }

  const notification = await createNotification(payload, groupId)

  // existing manuscript
  if (!newManuscript) {
    await CoarNotification.query()
      .findById(notification.id)
      .patch({ status: false })
  } else {
    await linkManuscriptToNotification(notification, newManuscript)
  }

  return { status: 202, message: 'Notification created successfully.' }
}

const getNotificationsForManuscript = async manuscriptId => {
  const notifications = (
    await CoarNotification.getNotificationsForManuscript(manuscriptId)
  ).map(n => ({ ...n, payload: JSON.stringify(n.payload) }))

  return notifications
}

module.exports = {
  getNotificationsForManuscript,
  sendAnnouncementNotification,
  sendTentativeAcceptCoarNotification,
  sendRejectCoarNotification,
  sendUnprocessableCoarNotification,
  processNotification,
  validateIPs,
}

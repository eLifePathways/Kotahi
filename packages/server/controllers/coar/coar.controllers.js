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
  Token,
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
  const activeConfig = await Config.getCached(groupId)

  const actor = {
    id: 'https://kotahi.community',
    type: 'Organization',
    name: 'Kotahi',
  }

  if (activeConfig) {
    const { rorUrl, title } = activeConfig.formData?.groupIdentity ?? {}

    if (rorUrl && title) {
      actor.id = rorUrl
      actor.name = title
    }
  }

  const payload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    actor,
    id: generateUrn(),
    inReplyTo: notificationId,
    object: originalPayload,
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

    await createNotification(payload, groupId, manuscriptId)

    return response ? response.data : false
  } catch (e) {
    logger.error(`Failed to send COAR UnprocessableNotification: ${e}`)
    return false
  }
}

const createNotification = async (payload, groupId, manuscriptId = null) => {
  const notification = await CoarNotification.query().insert({
    payload,
    ...(groupId ? { groupId } : {}),
    ...(manuscriptId ? { manuscriptId } : {}),
  })

  return notification
}

const updateNotification = async (
  reprocessNotification,
  payload,
  groupId,
  manuscriptId = null,
) => {
  return reprocessNotification.$query().patchAndFetch({
    groupId,
    payload,
    ...(manuscriptId ? { manuscriptId } : {}),
  })
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

  if (!doiMetadata) {
    throw new Error(
      `Could not find metadata for DOI ${doi}. Please verify with ${doiRa}`,
    )
  }

  const existingManuscript = await getManuscriptByDoi(doi, groupId)

  if (existingManuscript) return null

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

const validateAuthToken = async (authHeader, groupId) => {
  const coarAuthToken = await Token.getTokenByNameAndGroupId('coar', groupId)

  if (!coarAuthToken) {
    return true
  }

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  return coarAuthToken === providedToken
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
    if (
      payload.type.includes('Offer') &&
      payload.type.includes('coar-notify:ReviewAction')
    ) {
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

const hasValidContext = payload => {
  const context = payload['@context']

  return (
    context &&
    Array.isArray(context) &&
    context.some(c => c.includes('w3.org/ns/activitystreams'))
  )
}

const generate400Error = message => ({ status: 400, message })

/**
 * Process a given COAR Notify payload to create a manuscript for a given group
 * @param {*} groupId Group ID to assign the COAR Notify message
 * @param {*} payload COAR Notify Payload being processed
 * @param {*} [reprocessNotification] This notification is being reprocessed, due to a previous error. This notification will be updated with the valid payload.
 * @returns {Promise<{status: number, message: string}>}
 */
const processNotification = async (
  groupId,
  payload,
  reprocessNotification = null,
) => {
  const doi = extractDoi(payload)

  if (!hasValidContext(payload)) {
    return generate400Error('Property `@context` is invalid')
  }

  if (!payload.id) {
    return generate400Error('Property `id` is missing from payload')
  }

  if (!payload.object || !payload.object.id) {
    return generate400Error(
      `Property ${'`object`'} is missing ${
        !payload.object ? '' : '`id` '
      }from payload`,
    )
  }

  if (!payload.origin) {
    return generate400Error('Property `origin` is missing from payload')
  }

  if (!payload.target) {
    return generate400Error('Property `target` is missing from payload')
  }

  const type = extractNotificationType(payload)

  if (!type) {
    return generate400Error(
      `Invalid/unsupported notification type: ${payload.type}. Only 'Request Review' and 'Undo Offer' patterns are accepted`,
    )
  }

  if (
    type === 'Undo' &&
    (!payload.inReplyTo || payload.inReplyTo !== payload.object.id)
  ) {
    return generate400Error(
      `Property ${'`inReplyTo`'} ${
        !payload.inReplyTo
          ? 'is missing from payload'
          : 'does not match `object.id`'
      }`,
    )
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

    if (!reprocessNotification) {
      await createNotification(payload, groupId, existingManuscript.id)
    } else {
      await updateNotification(
        reprocessNotification,
        payload,
        groupId,
        existingManuscript.id,
      )
    }

    await archiveManuscript(existingManuscript.id)

    return { status: 202, message: 'Manuscript archived successfully' }
  }

  if (existingNotification && !reprocessNotification) {
    return generate400Error(
      'Notification already exists with the same payload.',
    )
  }

  // may contain the error message to be returned
  const doiRa = await getDoiRegistrationAgency(doi)

  if (!supportedDoiRegistrationAgencies.includes(doiRa)) {
    return generate400Error(doiRa)
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
    return generate400Error(extractError.message)
  }

  if (!newManuscript && reprocessNotification) {
    return generate400Error('Manuscript already exists with DOI.')
  }

  let notification

  if (!reprocessNotification) {
    notification = await createNotification(payload, groupId)
  } else {
    notification = await updateNotification(
      reprocessNotification,
      payload,
      groupId,
    )
  }

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

const reprocessCoarNotifyPayload = async (
  groupId,
  existingNotificationId,
  stringifiedPayload,
) => {
  const existingNotification = await CoarNotification.findById(
    existingNotificationId,
  )

  if (!existingNotification) {
    return {
      success: false,
      reason: `Existing COAR Notify message not found for id: ${existingNotificationId}`,
    }
  }

  const payload = JSON.parse(stringifiedPayload)

  try {
    const { message, status } = await processNotification(
      groupId,
      payload,
      existingNotification,
    )

    if (status < 300) {
      return { success: true }
    }

    return { success: false, reason: message }
  } catch (e) {
    logger.error('reprocessCoarNotifyPayload failed:', e.message)
    return { success: false, reason: e.message }
  }
}

const getNotificationsForManuscript = async manuscriptId => {
  const notifications = (
    await CoarNotification.getNotificationsForManuscript(manuscriptId)
  ).map(n => ({ ...n, payload: JSON.stringify(n.payload) }))

  return notifications
}

const getPaginatedNotificationsForGroup = async (
  groupId,
  filters,
  offset,
  limit,
) => {
  const { messages, totalCount } =
    await CoarNotification.getPaginatedNotificationsAndManuscriptsByGroupOrNone(
      groupId,
      filters,
      offset,
      limit,
    )

  return {
    messages: messages.map(n => ({ ...n, payload: JSON.stringify(n.payload) })),
    totalCount,
  }
}

module.exports = {
  createNotification,
  getPaginatedNotificationsForGroup,
  getNotificationsForManuscript,
  sendAnnouncementNotification,
  sendTentativeAcceptCoarNotification,
  sendRejectCoarNotification,
  sendUnprocessableCoarNotification,
  processNotification,
  reprocessCoarNotifyPayload,
  validateAuthToken,
  validateIPs,
}

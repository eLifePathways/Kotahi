const { get } = require('lodash')
const { logger, serverUrl, request, useTransaction } = require('@coko/server')
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

const {
  rawAbstractToSafeHtml,
  rawTitleToSafeHtml,
} = require('../../services/importArticles/importTools')

let archiveManuscript
setImmediate(() => {
  archiveManuscript =
    require('../manuscript/manuscript.controllers').archiveManuscript
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
    logger.error(`Failed to find RA for DOI ${doi}`)
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
  options = {},
) => {
  const offerNotification =
    await CoarNotification.getOfferNotificationForManuscript(
      manuscript.id,
      options,
    )

  if (!offerNotification) {
    logger.error(
      'COAR: sendTentativeAcceptNotification: no notification found for manuscript',
      manuscript.id,
    )
    return false
  }

  // Only one TentativeAccept per Offer, regardless of how many editors are assigned
  const existingTentativeAccept =
    await CoarNotification.getTentativeAcceptNotificationForOffer(
      manuscript.id,
      offerNotification.payload.id,
      options,
    )

  if (existingTentativeAccept) {
    logger.info(
      'COAR: sendTentativeAcceptNotification: already sent for offer',
      offerNotification.payload.id,
    )
    return false
  }

  const handlingEditor = await User.findOneWithIdentity(
    handlingEditorIds[0],
    'orcid',
    options,
  )

  handlingEditor.orcid = handlingEditor.identities[0]?.identifier

  const group = await Group.findById(manuscript.groupId, options)

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

    await createNotification(
      tentativeAcceptPayload,
      group.id,
      manuscript.id,
      options,
    )

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
  options = {},
) => {
  const { id: notificationId, origin, target } = originalPayload
  const activeConfig = await Config.getCached(groupId, options)

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

    await createNotification(payload, groupId, manuscriptId, options)

    return response ? response.data : false
  } catch (e) {
    logger.error(`Failed to send COAR UnprocessableNotification: ${e}`)
    return false
  }
}

const createNotification = async (
  payload,
  groupId,
  manuscriptId = null,
  options = {},
) => {
  const notification = await CoarNotification.insert(
    {
      payload,
      ...(groupId ? { groupId } : {}),
      ...(manuscriptId ? { manuscriptId } : {}),
    },
    options,
  )

  return notification
}

const updateNotification = async (
  reprocessNotification,
  payload,
  groupId,
  manuscriptId = null,
  options = {},
) => {
  const { trx } = options

  return reprocessNotification.$query(trx).patchAndFetch({
    groupId,
    payload,
    ...(manuscriptId ? { manuscriptId } : {}),
  })
}

const getManuscriptByDoi = async (doi, groupId, options = {}) => {
  const manuscript = await Manuscript.findOne(
    { doi, groupId, isHidden: false },
    options,
  )
  return manuscript
}

const getAdditionalMetadata = async (data, groupId, options = {}) => {
  const submissionForm = await getSubmissionForm(groupId, options)

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

const extractManuscriptFromNotification = async (
  payload,
  groupId,
  doiRa,
  options = {},
) => {
  const { trx } = options
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

  const existingManuscript = await getManuscriptByDoi(doi, groupId, options)

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
    options,
  )

  const newManuscript = {
    submission: {
      datePublished: publishedDate,
      $abstract: rawAbstractToSafeHtml(abstract) || '',
      firstAuthor: author,
      journal,
      topics,
      $doi: doi,
      url,
      $title: rawTitleToSafeHtml(title) || '',
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

  const manuscript = await Manuscript.query(trx).upsertGraphAndFetch(
    newManuscript,
    { relate: true },
  )

  return manuscript
}

const validateAuthToken = async (authHeader, groupId, options = {}) => {
  const coarAuthToken = await Token.getTokenByNameAndGroupId(
    'coar',
    groupId,
    options,
  )

  if (!coarAuthToken) {
    return false
  }

  const providedToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null

  return coarAuthToken === providedToken
}

const linkManuscriptToNotification = async (
  notification,
  manuscript,
  options = {},
) => {
  const manuscriptId = manuscript.id
  const { trx } = options
  await CoarNotification.query(trx)
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
 * @param {*} options Optional options, which may include a `trx` transaction object
 * @returns {Promise<{status: number, message: string}>}
 */
const processNotification = async (
  groupId,
  payload,
  reprocessNotification = null,
  options = {},
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
      options,
    )

  if (type === 'Undo') {
    if (!existingNotification) {
      return { status: 404, message: 'Notification not found' }
    }

    const existingManuscript = await Manuscript.findById(
      existingNotification.manuscriptId,
      { ...options, throwIfNotFound: false },
    )

    if (!existingManuscript || existingManuscript.isHidden) {
      return { status: 404, message: 'Manuscript not found' }
    }

    if (!reprocessNotification) {
      await createNotification(payload, groupId, existingManuscript.id, options)
    } else {
      await updateNotification(
        reprocessNotification,
        payload,
        groupId,
        existingManuscript.id,
        options,
      )
    }

    await archiveManuscript(existingManuscript.id, options)

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
      options,
    )
  } catch (extractError) {
    return generate400Error(extractError.message)
  }

  // A manuscript with this DOI already exists (e.g. a manual submission), so let the sender know
  if (!newManuscript) {
    return generate400Error('Manuscript already exists with DOI.')
  }

  let notification

  if (!reprocessNotification) {
    notification = await createNotification(payload, groupId, null, options)
  } else {
    notification = await updateNotification(
      reprocessNotification,
      payload,
      groupId,
      null,
      options,
    )
  }

  await linkManuscriptToNotification(notification, newManuscript, options)

  return { status: 202, message: 'Notification created successfully.' }
}

const reprocessCoarNotifyPayload = async (
  groupId,
  existingNotificationId,
  stringifiedPayload,
) => {
  const existingNotification = await CoarNotification.findById(
    existingNotificationId,
    { throwIfNotFound: false },
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

/** Carries a non-2xx result out of the transaction, so that it rolls back */
class InboxMessageRejection extends Error {
  constructor({ status, message }) {
    super(message)
    this.status = status
  }
}

/**
 * Stores the rejected payload and sends an UnprocessableNotification to its origin.
 * Runs in its own transaction, after the processing transaction has rolled back.
 */
const recordRejectedInboxMessage = async (message, payload, groupId) => {
  try {
    await useTransaction(async trx => {
      await createNotification(payload, groupId, null, { trx })
      await sendUnprocessableCoarNotification(message, payload, null, groupId, {
        trx,
      })
    })
  } catch (error) {
    logger.error('COAR: failed to record rejected inbox message', error)
  }
}

const handleIncomingInboxMessage = async (payload, groupName, authHeader) => {
  let groupId = null
  let result

  try {
    result = await useTransaction(async trx => {
      const group = await Group.findOne({ name: groupName }, { trx })
      groupId = group?.id || null

      if (!group) {
        throw new InboxMessageRejection({
          status: 404,
          message: 'Group not found',
        })
      }

      if (!(await validateAuthToken(authHeader, groupId, { trx }))) {
        throw new InboxMessageRejection({
          status: 403,
          message: 'Unauthorised Request',
        })
      }

      if (
        !(
          payload &&
          typeof payload === 'object' &&
          !!Object.keys(payload).length
        )
      ) {
        throw new InboxMessageRejection({
          status: 400,
          message: 'No payload provided',
        })
      }

      const processResult = await processNotification(groupId, payload, null, {
        trx,
      })

      if (processResult.status > 299) {
        throw new InboxMessageRejection(processResult)
      }

      return processResult
    })
  } catch (error) {
    if (error instanceof InboxMessageRejection) {
      result = { status: error.status, message: error.message }
    } else {
      logger.error(error)
      result = { status: 500, message: 'Failed to create notification.' }
    }

    await recordRejectedInboxMessage(result.message, payload, groupId)
  }

  return result
}

module.exports = {
  createNotification,
  getPaginatedNotificationsForGroup,
  getNotificationsForManuscript,
  handleIncomingInboxMessage,
  sendAnnouncementNotification,
  sendTentativeAcceptCoarNotification,
  sendRejectCoarNotification,
  sendUnprocessableCoarNotification,
  processNotification,
  reprocessCoarNotifyPayload,
  validateAuthToken,
}

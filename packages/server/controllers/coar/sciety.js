const { serverUrl, uuid, request, logger } = require('@coko/server')

const {
  getFlaxUrl,
  getReviewer,
  isReviewDoi,
  isFlaxSetup,
} = require('./announcement')

const { CoarNotification, Config, Group } = require('../../models')

const getScietyInboxUrl = async groupId => {
  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const coarNotifyFormData = activeConfig.formData.integrations.coarNotify

  let url = ''

  if (coarNotifyFormData) {
    url = coarNotifyFormData.scietyInboxUrl
  }

  return url
}

const getRequestData = async manuscript => {
  const group = await Group.query().findById(manuscript.groupId).first()
  const reviewer = await getReviewer(manuscript)

  const { payload } =
    (await CoarNotification.findOne({
      manuscriptId: manuscript.id,
    })) || {}

  if (!payload) return false

  const { flaxReviewUrl, flaxUrl } = await getFlaxUrl(
    group.name,
    manuscript.shortId,
  )

  const defaultPayload = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      'https://coar-notify.net',
    ],
    id: `urn:uuid:${uuid()}`,
    type: ['Announce', 'coar-notify:ReviewAction'],
    origin: {
      id: serverUrl,
      inbox: `${serverUrl}/api/coar/inbox/${group.name}`,
      type: 'Service',
    },
    target: {
      id: 'https://sciety.org',
      inbox: await getScietyInboxUrl(group.id),
      type: 'Service',
    },
    object: {
      id: reviewer ? flaxReviewUrl : flaxUrl,
      type: ['Document', 'sorg:Review'],
    },
    actor: {
      type: 'Service',
      id: 'https://kotahi.community',
      name: 'Kotahi',
    },
    context: {
      id: `https://doi.org/${manuscript.doi}`,
    },
    inReplyTo: payload.id,
  }

  if (reviewer) {
    defaultPayload.actor = {
      type: 'Person',
      id: reviewer.orcid
        ? `https://orcid.org/${reviewer.orcid}`
        : reviewer.email,
      name: reviewer.username,
    }
  }

  return JSON.stringify(defaultPayload)
}

const sendAnnouncementNotificationToSciety = async manuscript => {
  const { groupId, id: manuscriptId } = manuscript
  const requestData = await getRequestData(manuscript)
  const inboxUrl = await getScietyInboxUrl(groupId)

  if ((!isReviewDoi() && !isFlaxSetup()) || !inboxUrl || !requestData) {
    return false
  }

  const payload = JSON.parse(requestData)

  try {
    const response = await request({
      method: 'post',
      url: inboxUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      data: requestData,
    })

    await CoarNotification.query().insert({ groupId, manuscriptId, payload })

    return response ? response.data : false
  } catch (err) {
    logger.error(err)
    throw err
  }
}

module.exports = { sendAnnouncementNotificationToSciety }

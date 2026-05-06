/* eslint-disable no-await-in-loop */
const TurndownService = require('turndown')
const axios = require('axios')

const Config = require('../../../models/config/config.model')
const PublishedArtifact = require('../../../models/publishedArtifact/publishedArtifact.model')

const { getUsersById } = require('../../../controllers/user.controllers')
const { getActiveForms } = require('../../../controllers/form.controllers')
const { getPublishableFields, normalizeUri } = require('./hypothesisTools')
const { upsertArtifact, deleteArtifact } = require('../publishingCommsUtils')

const {
  getThreadedDiscussionsForManuscript,
} = require('../../../controllers/threadedDiscussion.controllers')

const REQUEST_URL = `https://api.hypothes.is/api/annotations`

/** DELETE a publication from Hypothesis via REST */
const deletePublication = async (publicationId, headers) => {
  try {
    const response = await axios.delete(`${REQUEST_URL}/${publicationId}`, {
      ...headers,
      data: {},
    })

    return response
    /* eslint-disable-next-line */
  } catch (e) {
    return null
  }
}

/** Check with hypothes.is that this annotation already exists; return true or false. */
const annotationActuallyExists = async (data, headers) => {
  try {
    await axios.get(`${REQUEST_URL}/${data.annotationId}`, {
      ...headers,
    })
    return true
    /* eslint-disable-next-line */
  } catch (e) {
    return false
  }
}

const prepareTurndownService = () =>
  new TurndownService({ bulletListMarker: '*' })

const publishToHypothesis = async manuscript => {
  const activeConfig = await Config.getCached(manuscript.groupId)

  const headers = {
    headers: {
      Authorization: `Bearer ${activeConfig.formData.publishing.hypothesis.apiKey}`,
    },
  }

  const turndownService = prepareTurndownService()

  const uri = manuscript.submission.$sourceUri
  const title = manuscript.submission.$title

  const publishableFieldData = getPublishableFields(
    manuscript,
    await getActiveForms(manuscript.groupId),
    await getThreadedDiscussionsForManuscript(manuscript, getUsersById),
  )

  const fields = await Promise.all(
    publishableFieldData.map(async d => {
      if (['create', 'update'].includes(d.action) && !uri)
        throw new Error('Missing field submission.$sourceUri')

      if (
        d.action === 'update' &&
        !(await annotationActuallyExists(d, headers))
      )
        return { ...d, action: 'create' }
      if (
        d.action === 'delete' &&
        !(await annotationActuallyExists(d, headers))
      )
        return { ...d, action: null }

      if (d.action === null && !uri)
        throw new Error('Missing field submission.$sourceUri')

      return d
    }),
  )

  if (activeConfig.formData.publishing.hypothesis.reverseFieldOrder)
    fields.reverse()

  // Some fields have dates (e.g. review fields; ThreadedDiscussion comments) and should be published in date order.
  const threadedDiscussionFields = fields
    .filter(f => f.field.component === 'ThreadedDiscussion')
    .sort((a, b) => a.date - b.date)

  const fieldsWithoutThreadedDiscussion = fields.filter(
    f => f.field.component !== 'ThreadedDiscussion',
  )

  const fieldsToPublish = [
    ...fieldsWithoutThreadedDiscussion,
    ...threadedDiscussionFields,
  ]

  for (const f of fieldsToPublish) {
    const artifact = {
      title: `${f.publishingTag || f.fieldTitle}: ${title}`,
      // Using a template for content means it's an invariant identifier.
      // We can use this field to find if this has previously been
      // published to Hypothesis, and what the Hypothesis ID is.
      content: `{{${f.objectId}.${f.fieldName}}}`,
      manuscriptId: manuscript.id,
      platform: 'Hypothesis',
      externalId: f.annotationId,
      hostedInKotahi: true,
      relatedDocumentUri: normalizeUri(uri),
      relatedDocumentType: 'preprint',
    }

    if (['create', 'update'].includes(f.action)) {
      const requestBody = {
        group: activeConfig.formData.publishing.hypothesis.group,
        permissions: {
          read: [`group:${activeConfig.formData.publishing.hypothesis.group}`],
        },
        uri: normalizeUri(uri),
        document: { title: [title] },
        text: turndownService.turndown(f.text),
        tags: f.publishingTag ? [f.publishingTag] : [],
      }

      if (f.action === 'create') {
        const response = await axios.post(REQUEST_URL, requestBody, headers)
        await upsertArtifact({ ...artifact, externalId: response.data.id })
      } else if (f.action === 'update') {
        await axios.patch(
          `${REQUEST_URL}/${f.annotationId}`,
          requestBody,
          headers,
        )
        await upsertArtifact(artifact)
      }
    } else if (f.action === 'delete') {
      await deletePublication(f.annotationId, headers)
      await deleteArtifact(manuscript.id, f.annotationId)
    }
  }
}

const publishSpecificAnnotationToHypothesis = async (
  content,
  contentTemplate,
  tag,
  uri,
  manuscriptTitle,
  manuscriptId,
  groupId,
) => {
  const activeConfig = await Config.getCached(groupId)

  const headers = {
    headers: {
      Authorization: `Bearer ${activeConfig.formData.publishing.hypothesis.apiKey}`,
    },
  }

  const turndownService = prepareTurndownService()

  const existingArtifact = await PublishedArtifact.query().findOne({
    manuscriptId,
    content: contentTemplate,
  })

  let externalId = existingArtifact ? existingArtifact.externalId : null

  const artifact = {
    title: `${tag}: ${manuscriptTitle}`,
    // Using a template for content means it's an invariant identifier.
    // We can use this field to find if this has previously been
    // published to Hypothesis, and what the Hypothesis ID is.
    content: contentTemplate,
    manuscriptId,
    platform: 'Hypothesis',
    externalId,
    hostedInKotahi: true,
    relatedDocumentUri: normalizeUri(uri),
    relatedDocumentType: 'preprint',
  }

  const requestBody = {
    group: activeConfig.formData.publishing.hypothesis.group,
    permissions: {
      read: [`group:${activeConfig.formData.publishing.hypothesis.group}`],
    },
    uri: normalizeUri(uri),
    document: { title: [manuscriptTitle] },
    text: turndownService.turndown(content),
    tags: tag ? [tag] : [],
  }

  let artifactId

  if (existingArtifact) {
    await axios.patch(`${REQUEST_URL}/${externalId}`, requestBody, headers)
    artifactId = await upsertArtifact(artifact)
  } else {
    const response = await axios.post(REQUEST_URL, requestBody, headers)
    externalId = response.data.id
    artifactId = await upsertArtifact({ ...artifact, externalId })
  }

  return { artifactId, externalId }
}

module.exports = {
  publishToHypothesis,
  publishSpecificAnnotationToHypothesis,
  deletePublication,
}

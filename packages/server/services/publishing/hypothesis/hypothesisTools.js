const { get } = require('lodash')

const {
  getPublishableTextFromValue,
} = require('../../../utils/fieldFormatUtils')

const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return null

  return commentObject.commentVersions[commentObject.commentVersions.length - 1]
    .comment
}

const getFieldNamesLastPublished = (objectId, publishedArtifacts) => {
  const prefix = `{{${objectId}.`

  return [
    ...new Set(
      publishedArtifacts
        .map(a => a.content)
        .filter(content => content.startsWith(prefix))
        .map(x => x.split(prefix)[1].split(/[:}]/)[0]),
    ),
  ]
}

const getPublishableFieldsForObject = (
  formFieldsToPublish,
  data,
  form,
  threadedDiscussions,
  objectId,
  publishedArtifacts,
  objectDate,
) => {
  if (!form) return []
  const { fieldsToPublish } = formFieldsToPublish || { fieldsToPublish: [] }

  const {
    structure: { children: fields },
  } = form

  const lastPublishedFields = getFieldNamesLastPublished(
    objectId,
    publishedArtifacts,
  )

  return fields
    .filter(
      f =>
        ['always', 'true'].includes(f.permitPublishing) ||
        lastPublishedFields.includes(f.name),
    )
    .map(field => {
      const { publishingTag } = field
      const value = get(data, field.name)

      if (field.component === 'ThreadedDiscussion') {
        const discussion = threadedDiscussions.find(td => td.id === value)
        if (!discussion) return []

        return discussion.threads.map(t =>
          t.comments.map(c => {
            const text = getPublishableTextFromComment(c)
            const expandedFieldName = `${field.name}:${c.id}`

            const shouldPublish =
              text &&
              (field.permitPublishing === 'always' ||
                fieldsToPublish.includes(expandedFieldName))

            return {
              field,
              fieldName: expandedFieldName,
              fieldTitle: field.shortDescription || field.title,
              text,
              date: c.created,
              shouldPublish,
              publishingTag,
              objectId,
            }
          }),
        )
      }

      const text = getPublishableTextFromValue(value, field)

      const shouldPublish =
        text &&
        (field.permitPublishing === 'always' ||
          fieldsToPublish.includes(field.name))

      return {
        field,
        fieldName: field.name,
        fieldTitle: field.shortDescription || field.title,
        text,
        date: objectDate,
        shouldPublish,
        publishingTag,
        objectId,
      }
    })
    .flat(3)
}

/** Returns an entry for all fields that could be published, whether they are selected for publishing or not.
 * Each entry contains the field specification, the data value, and whether that field should be published.
 * ThreadedDiscussions are treated specially. Instead of one entry for the ThreadedDiscussion field, there are multiple
 * entries, one for each comment.
 */
const getPublishableFields = (manuscript, forms, threadedDiscussions) => {
  const result = []

  result.push(
    ...getPublishableFieldsForObject(
      manuscript.formFieldsToPublish.find(ff => ff.objectId === manuscript.id),
      manuscript,
      forms.submissionForm,
      threadedDiscussions,
      manuscript.id,
      manuscript.publishedArtifacts,
      null,
    ),
  )

  manuscript.reviews
    .sort((a, b) => b.created - a.created)
    .filter(r => !r.isDecision)
    .forEach(r =>
      result.push(
        ...getPublishableFieldsForObject(
          manuscript.formFieldsToPublish.find(ff => ff.objectId === r.id),
          r.jsonData,
          forms.reviewForm,
          threadedDiscussions,
          r.id,
          manuscript.publishedArtifacts,
          r.updated,
        ),
      ),
    )

  manuscript.reviews
    .filter(r => r.isDecision)
    .forEach(r =>
      result.push(
        ...getPublishableFieldsForObject(
          manuscript.formFieldsToPublish.find(ff => ff.objectId === r.id),
          r.jsonData,
          forms.decisionForm,
          threadedDiscussions,
          r.id,
          manuscript.publishedArtifacts,
          null,
        ),
      ),
    )

  return result.map(d => {
    const annotationName = `${d.objectId}.${d.fieldName}`
    const content = `{{${annotationName}}}`

    const priorArtifact = manuscript.publishedArtifacts.find(
      a => a.content === content,
    )

    const annotationId = priorArtifact ? priorArtifact.externalId : null
    const hasPreviousValue = !!annotationId
    let action
    if (d.shouldPublish) action = hasPreviousValue ? 'update' : 'create'
    else action = hasPreviousValue ? 'delete' : null
    return { ...d, annotationName, annotationId, action, content }
  })
}

/** If the URI published to hypothes.is doesn't match the URI of the viewed page, annotations will not be visible in the context of that page.
 * This especially impacts biorxiv items, which are imported without a subdomain, but are given the www subdomain when viewing the page.
 * Here we fix that.
 */
const normalizeUri = uri =>
  uri.replace(
    /(https?:\/\/)?(www\.)?biorxiv\.org\//,
    'https://www.biorxiv.org/',
  )

module.exports = {
  getPublishableFields,
  normalizeUri,
}

const Handlebars = require('handlebars')
const { set, get } = require('lodash')

const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { ensureJsonIsParsed } = require('../../utils/objectUtils')

const { getPublishableTextFromValue } = require('../../utils/fieldFormatUtils')

/** This returns a modified array of reviews, omitting fields or entire reviews marked as
 * hidden from author, UNLESS the current user is the reviewer the review belongs to.
 * This does not consider whether the user is a groupManager/admin or editor of the manuscript:
 * that must be checked elsewhere.
 */
const stripConfidentialDataFromReviews = (
  reviews,
  reviewForm,
  decisionForm,
  sharedReviewersIds,
  userId,
  userRoles,
  manuscriptHasDecision,
) => {
  if (!reviewForm || !decisionForm) return []

  // Authors and general users can't see data that's hidden from users
  const reviewFieldsHiddenFromAuthor = reviewForm.structure.children
    .filter(f => f.hideFromAuthors === 'true')
    .map(f => f.name)

  const decisionFieldsHiddenFromAuthor = decisionForm.structure.children
    .filter(f => f.hideFromAuthors === 'true')
    .map(f => f.name)

  const decisionThreadedDiscussionFields = decisionForm.structure.children
    .filter(f => f.component === 'ThreadedDiscussion')
    .map(f => f.name)

  return reviews
    .map(review => {
      const hasPrivilegedAccess =
        review.userId === userId ||
        userRoles.collaborativeReviewer ||
        (review.isDecision && userRoles.reviewer && manuscriptHasDecision) ||
        userRoles.anyEditorOrManager ||
        review.isSharedWithCurrentUser

      if (!hasPrivilegedAccess && review.isHiddenFromAuthor) return null
      // Reviews are not made available to the author until after the decision
      if (!hasPrivilegedAccess && !review.isDecision && !manuscriptHasDecision)
        return null
      // TODO Two other unprivileged cases we should return null for:
      // - if the review is not a decision and it hasn't been completed;
      // - if the current user is not the manuscript author and the manuscript hasn't yet been published.

      const r = { ...review, jsonData: ensureJsonIsParsed(review.jsonData) }
      if (hasPrivilegedAccess) return r
      if (r.isHiddenReviewerName) r.userId = null

      const hiddenFields = r.isDecision
        ? decisionFieldsHiddenFromAuthor
        : reviewFieldsHiddenFromAuthor

      const filteredJsonData = {}

      Object.entries(r.jsonData).forEach(([key, value]) => {
        // ThreadedDiscussions in decisions are shown even before the decision is complete,
        // in order that the discussion can continue.
        const isThreadedDiscussionFieldInDecision =
          r.isDecision && decisionThreadedDiscussionFields.includes(key)

        const isVisible =
          !hiddenFields.includes(key) &&
          (manuscriptHasDecision || isThreadedDiscussionFieldInDecision)

        if (isVisible) filteredJsonData[key] = value
      })
      r.jsonData = filteredJsonData
      return r
    })
    .filter(Boolean)
}

/** Get evaluations as
 * [
 *  [submission.review1, submission.review1date],
 *  [submission.review2, submission.review2date],
 *  ...,
 *  [submission.summary, submission.summarydate]
 * ]
 * These are evaluations in the submission form, NOT normal reviews. */
const getEvaluationsAndDates = manuscript => {
  const evaluationValues = Object.entries(manuscript.submission)
    .filter(
      ([prop]) =>
        !Number.isNaN(Number(prop.split('review')[1])) &&
        prop.includes('review'),
    )
    .map(([propName, value]) => [
      value,
      manuscript.submission[`${propName}date`],
    ])

  evaluationValues.push([
    manuscript.submission.summary,
    manuscript.submission.summarydate,
  ])

  return evaluationValues
}

const hasElifeStyleEvaluations = manuscript => {
  const evaluations = getEvaluationsAndDates(manuscript)
  return evaluations.map(checkIsAbstractValueEmpty).some(isEmpty => !isEmpty)
}

/** Get the current version of a ThreadedDiscussion comment */
const getPublishableTextFromComment = commentObject => {
  if (!commentObject.commentVersions || !commentObject.commentVersions.length)
    return ''

  return commentObject.commentVersions[commentObject.commentVersions.length - 1]
    .comment
}

/** For a given form and corresponding data object, generate entries in the fieldsMap for all fields.
 * fieldsMap will be given a nested structure of keys (field names) and values. If objectId is supplied,
 * that will be inserted at the top of the nested structure. objectId may be a uuid, or may simply be a
 * text name such as 'decision'.
 * Currently, some data is added to the map twice: once with a uuid at the top, and once with a simple string
 * (or nothing) at the top. This permits the resulting map to be used in different circumstances.
 */
const addAllFieldsToTemplatingMap = (
  fieldsMap,
  objectId,
  formData,
  form,
  threadedDiscussions,
) => {
  form.structure.children.forEach(field => {
    let value = get(formData, field.name)

    if (field.component === 'ThreadedDiscussion') {
      if (!threadedDiscussions) return
      const discussion = threadedDiscussions.find(td => td.id === value)
      if (!discussion) return

      discussion.threads.forEach(thread => {
        thread.comments.forEach(comment => {
          const text = getPublishableTextFromComment(comment)
          set(
            fieldsMap,
            `${objectId ? `${objectId}.` : ''}${field.name}:${comment.id}`,
            text,
          )
        })
      })
      return
    }

    // we might be dealing with a review
    if (value === undefined) {
      value = get(ensureJsonIsParsed(formData?.jsonData) ?? {}, field.name)
    }

    const content = getPublishableTextFromValue(value, field)
    set(fieldsMap, `${objectId ? `${objectId}.` : ''}${field.name}`, content)
  })
}

/** Resolve inconsistencies in URI representations */
const getPreprintUri = manuscript => {
  let uri = manuscript.submission.$sourceUri

  if (typeof uri !== 'string') return null
  // Hypothesis autoredirects the following URIs, which is a pain:
  if (uri.startsWith('https://biorxiv.org/'))
    uri = uri.replace('https://biorxiv.org/', 'https://www.biorxiv.org/')
  return uri
}

/** Create a nested object with keys and values for all fields (and ThreadedDiscussion comments)
 * of the given manuscript, its reviews and decisions. This object is constructed as a lookup
 * for the Handlebar templating engine.
 */
const getFieldsMapForTemplating = (
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  // TODO Currently we have different code using two different styles:
  // '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.$authors', and
  // 'submission.$authors'.
  // We should simplify, so we only use the object IDs when referring to reviews
  // (since there may be multiple reviews).

  const fieldsMap = {
    shortId: manuscript.shortId,
    status: manuscript.status,
    meta: {
      title: manuscript.submission.$title || '', // TODO remove once we've migrated all templates
      abstract: manuscript.submission.$abstract || '', // TODO remove once we've migrated all templates
    },
    doi: manuscript.submission.$doi || '',
    uri: getPreprintUri(manuscript) || '',
    title: manuscript.submission.$title || '',
  }

  // Duplicate these entries with keys containing id, e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.shortId'
  Object.entries(fieldsMap).forEach(([key, val]) => {
    fieldsMap[`${manuscript.id}.${key}`] = val
  })

  // Add all submission fields referenced as e.g. '362521f6-4e57-4102-9c36-3f74f31ebef1.submission.$authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    manuscript.id,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all submission fields referenced as e.g. 'submission.$authors'
  addAllFieldsToTemplatingMap(
    fieldsMap,
    null,
    manuscript,
    submissionForm,
    manuscript.threadedDiscussions,
  )
  // Add all review and decision fields referenced as e.g. '913ed8c4-794e-470e-9214-9c77d90e0144.comment'
  manuscript.reviews.forEach(review =>
    addAllFieldsToTemplatingMap(
      fieldsMap,
      review.id,
      review,
      review.isDecision ? decisionForm : reviewForm,
      manuscript.threadedDiscussions,
    ),
  )
  // Add all decision fields referenced as e.g. 'decision.verdict'
  const decision = manuscript.reviews.find(r => r.isDecision)
  if (decision)
    addAllFieldsToTemplatingMap(
      fieldsMap,
      'decision',
      decision,
      decisionForm,
      manuscript.threadedDiscussions,
    )

  return fieldsMap
}

/** Expand all handlebars templates in the content of published artifacts */
const applyTemplatesToArtifacts = (
  artifacts,
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  const fieldsMap = artifacts.length
    ? getFieldsMapForTemplating(
        manuscript,
        submissionForm,
        reviewForm,
        decisionForm,
      )
    : null

  return artifacts.map(artifact => ({
    ...artifact,
    content: Handlebars.compile(artifact.content, { noEscape: true })(
      fieldsMap,
    ),
  }))
}

module.exports = {
  stripConfidentialDataFromReviews,
  hasElifeStyleEvaluations,
  applyTemplatesToArtifacts,
  getFieldsMapForTemplating,
}

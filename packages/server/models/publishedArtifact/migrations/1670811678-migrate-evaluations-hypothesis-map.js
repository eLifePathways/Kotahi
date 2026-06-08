const { useTransaction } = require('@coko/server')

const {
  getSubmissionForm,
  getReviewForm,
  getDecisionForm,
} = require('../../../controllers/review.controllers')

const Manuscript = require('../../manuscript/manuscript.model')
const PublishedArtifact = require('../publishedArtifact.model')

const fieldKeyRegex =
  /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}).([a-zA-Z]\w*|submission\.[a-zA-Z]\w*|meta.title|meta.abstract)(?::([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}))?$/

const getFieldTitle = (
  fieldId,
  manuscript,
  submissionForm,
  reviewForm,
  decisionForm,
) => {
  const regexResult = fieldKeyRegex.exec(fieldId)
  if (regexResult === null) return 'Unknown field'
  const objectId = regexResult[1]
  const fieldName = regexResult[2]
  // const messageId = regexResult.length > 3 ? regexResult[3] : null
  let form = submissionForm

  if (objectId !== manuscript.id) {
    const review = manuscript.reviews.find(r => r.id === objectId)
    if (!review) return fieldName
    form = review.isDecision ? decisionForm : reviewForm
  }

  const field = form.structure.children.find(f => f.name === fieldName)
  if (!field) return fieldName
  return field.title
}

exports.up = async () => {
  const manuscripts = await Manuscript.query()
    .withGraphFetched('reviews')
    .whereNotNull('evaluationsHypothesisMap')

  if (manuscripts.length > 0) {
    const submissionForm = await getSubmissionForm()
    const reviewForm = await getReviewForm()
    const decisionForm = await getDecisionForm()

    await useTransaction(async trx => {
      for (let i = 0; i < manuscripts.length; i += 1) {
        const manuscript = manuscripts[i]

        const artifacts = Object.entries(
          manuscript.evaluationsHypothesisMap,
        ).map(([key, value]) => ({
          manuscriptId: manuscript.id,
          platform: 'Hypothesis',
          externalId: value,
          content: `{{${key}}}`,
          title: getFieldTitle(
            key,
            manuscript,
            submissionForm,
            reviewForm,
            decisionForm,
          ),
          hostedInKotahi: true,
          relatedDocumentUri:
            manuscript.submission.link ||
            manuscript.submission.articleURL ||
            manuscript.submission.biorxivURL ||
            manuscript.submission.doi ||
            manuscript.submission.DOI,
          relatedDocumentType: 'preprint',
        }))

        // Updating one-by-one rather than all in parallel, to avoid exhausting available connections
        // eslint-disable-next-line no-await-in-loop
        await PublishedArtifact.query(trx).insert(artifacts)
      }
    })
  }
}

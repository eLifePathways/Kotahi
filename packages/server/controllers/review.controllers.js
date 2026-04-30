const isEmpty = require('lodash/isEmpty')

const { File } = require('@coko/server')

const {
  Form,
  Review,
  Manuscript,
  Team,
  TeamMember,
  User,
} = require('../models')

const { getFilesWithUrl } = require('../utils/fileStorageUtils')
const seekEvent = require('../services/notification.service')

const { getUserRolesInManuscript } = require('./user.controllers')

const {
  ensureJsonIsParsed,
  deepMergeObjectsReplacingArrays,
} = require('../utils/objectUtils')

/**
 * For all fields containing files, convert files expressed as simple IDs into
 * full object form with time-limited URL. This also converts any jsonData in
 * string form to a parsed object. This modifies the supplied review IN PLACE.
 */
const convertFilesToFullObjects = async (
  review,
  form,
  /** Function to return full file objects from DB, for an array of file IDs */
  getFilesByIds,
) => {
  const fileFieldNames = form.structure.children
    .filter(field =>
      ['SupplementaryFiles', 'VisualAbstract'].includes(field.component),
    )
    .map(field => field.name)

  review.jsonData = ensureJsonIsParsed(review.jsonData)

  for (const [key, value] of Object.entries(review.jsonData)) {
    if (fileFieldNames.includes(key)) {
      const fileRecords = Array.isArray(value) ? value : []
      const fileIds = fileRecords.map(file => file.id || file) // Paranoia, in case some files are already in full object form
      /* eslint-disable-next-line no-await-in-loop */
      const files = await getFilesByIds(fileIds)
      /* eslint-disable-next-line no-await-in-loop */
      review.jsonData[key] = await getFilesWithUrl(files)
    }
  }
}

/**
 * Checks through all fields containing files, and any files expressed in object form are replaced with simple IDs.
 * This also converts any jsonData in string form to a parsed object.
 * This modifies the supplied reviewDelta IN PLACE.
 */
const convertFilesToIdsOnly = (reviewDelta, form) => {
  if (!reviewDelta.jsonData) return
  if (typeof reviewDelta.jsonData === 'string')
    reviewDelta.jsonData = JSON.parse(reviewDelta.jsonData)

  const fileFieldNames = form.structure.children
    .filter(field =>
      ['SupplementaryFiles', 'VisualAbstract'].includes(field.component),
    )
    .map(field => field.name)

  for (const [key, value] of Object.entries(reviewDelta.jsonData)) {
    if (fileFieldNames.includes(key) && Array.isArray(value)) {
      reviewDelta.jsonData[key] = value.map(file => file.id || file)
    }
  }
}

const getDecisionForm = async (groupId, options = {}) =>
  getForm({ category: 'decision', purpose: 'decision', groupId }, options)

const getForm = async (categoryAndPurpose, options = {}) => {
  const { trx } = options

  const form = await Form.query(trx).where(categoryAndPurpose)

  if (!form || !form.length)
    throw new Error(`No form found for "${categoryAndPurpose.purpose}"`)

  return form[0]
}

const getReviewForm = async (groupId, options = {}) =>
  getForm({ category: 'review', purpose: 'review', groupId }, options)

const getSubmissionForm = async (groupId, options = {}) =>
  getForm({ category: 'submission', purpose: 'submit', groupId }, options)

const isReviewSharedWithCurrentUser = async (review, userId) => {
  if (
    review.isSharedWithCurrentUser ||
    review.isSharedWithCurrentUser === false
  )
    return !!review.isSharedWithCurrentUser

  const sharedMembers = await Team.relatedQuery('members')
    .for(
      Team.query().where({
        role: 'reviewer',
        objectId: review.manuscriptId,
      }),
    )
    .where({ isShared: true })
    .where(builder =>
      builder.where({ status: 'completed' }).orWhere({ userId }),
    )

  if (sharedMembers.some(m => m.userId === userId)) return true
  return false
}

const lockUnlockCollaborativeReview = async id => {
  const review = await Review.query()
    .findOne({
      id,
      isCollaborative: true,
    })
    .throwIfNotFound()

  const updatedReview = await Review.query()
    .patch({ isLock: !review.isLock })
    .findOne({ id })
    .returning('*')

  const team = await Team.query().findOne({
    role: 'collaborativeReviewer',
    objectId: updatedReview.manuscriptId,
    objectType: 'manuscript',
  })

  const status = updatedReview.isLock ? 'closed' : 'inProgress'
  await TeamMember.query()
    .patch({ status })
    .where({ teamId: team.id })
    .andWhere(builder => {
      builder.whereIn('status', ['closed', 'inProgress'])
    })

  const manuscript = await Manuscript.query().findById(
    updatedReview.manuscriptId,
  )

  const eventParam = updatedReview.isLock ? 'lock' : 'unlock'

  seekEvent(`collaborative-review-${eventParam}`, {
    manuscript,
    groupId: manuscript.groupId,
  })

  const form = await getReviewForm(manuscript.groupId)

  await convertFilesToFullObjects(
    updatedReview,
    form,
    async ids => File.query().findByIds(ids),
    getFilesWithUrl,
  )

  return {
    ...updatedReview,
    jsonData: JSON.stringify(updatedReview.jsonData),
  }
}

const reviewUser = async review => {
  if (review.user) return review.user
  // TODO redact user if it's an anonymous review and ctx.userId is not editor or admin
  return review.userId ? User.query().findById(review.userId) : null
}

const updateReview = async (id, input, userId) => {
  const reviewDelta = { jsonData: {}, ...input }
  const existingReview = (await Review.query().findById(id)) || {}

  const manuscript = await Manuscript.query()
    .findById(existingReview.manuscriptId || input.manuscriptId)
    .select('groupId')

  const form = existingReview.isDecision
    ? await getDecisionForm(manuscript.groupId)
    : await getReviewForm(manuscript.groupId)

  const roles = await getUserRolesInManuscript(
    existingReview.userId || userId,
    existingReview.manuscriptId || input.manuscriptId,
  )

  const reviewUserId = !isEmpty(existingReview) ? existingReview.userId : userId

  const userIdToApply = roles.collaborativeReviewer ? null : reviewUserId

  await convertFilesToIdsOnly(reviewDelta, form)

  const mergedReview = {
    canBePublishedPublicly: false,
    isHiddenFromAuthor: false,
    isHiddenReviewerName: false,
    isCollaborative: !!roles.collaborativeReviewer,
    ...deepMergeObjectsReplacingArrays(existingReview, reviewDelta),
    // Prevent reassignment of userId or manuscriptId:
    userId: userIdToApply,
    manuscriptId: existingReview.manuscriptId || input.manuscriptId,
  }

  // Prevent reassignment of isDecision
  if (typeof existingReview.isDecision === 'boolean')
    mergedReview.isDecision = existingReview.isDecision

  // Ensure the following aren't null or undefined
  mergedReview.canBePublishedPublicly = !!mergedReview.canBePublishedPublicly
  mergedReview.isHiddenFromAuthor = !!mergedReview.isHiddenFromAuthor
  mergedReview.isHiddenReviewerName = !!mergedReview.isHiddenReviewerName

  const review = await Review.query().upsertGraphAndFetch(
    {
      id,
      ...mergedReview,
      jsonData: JSON.stringify(mergedReview.jsonData),
    },
    { insertMissing: true },
  )

  // We want to modify file URIs before return, so we'll use the parsed jsonData
  review.jsonData = mergedReview.jsonData

  const userOfReview = review.userId
    ? await User.query().findById(review.userId)
    : null

  await convertFilesToFullObjects(
    review,
    form,
    async ids => File.query().findByIds(ids),
    getFilesWithUrl,
  )

  return {
    id: review.id,
    created: review.created,
    updated: review.updated,
    isDecision: review.isDecision,
    open: review.open,
    user: userOfReview,
    isHiddenFromAuthor: review.isHiddenFromAuthor,
    isHiddenReviewerName: review.isHiddenReviewerName,
    isCollaborative: review.isCollaborative,
    isLock: review.isLock,
    canBePublishedPublicly: review.canBePublishedPublicly,
    jsonData: JSON.stringify(review.jsonData),
    manuscriptId: review.manuscriptId,
  }
}

const updateReviewerTeamMemberStatus = async (manuscriptId, status, userId) => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .withGraphFetched('[submitter.defaultIdentity, channels.members]')

  const teams = await manuscript
    .$relatedQuery('teams')
    .whereIn('role', ['reviewer', 'collaborativeReviewer'])

  const member = await TeamMember.query()
    .whereIn(
      'teamId',
      teams.map(t => t.id),
    )
    .andWhere({ userId })
    .first()

  if (status === 'completed') {
    seekEvent(`review-completed`, {
      manuscript,
      groupId: manuscript.groupId,
    })
  }

  return member.$query().patchAndFetch({
    status,
    updated: new Date().toISOString(),
  })
}

module.exports = {
  convertFilesToFullObjects,
  getDecisionForm,
  getReviewForm,
  getSubmissionForm,
  isReviewSharedWithCurrentUser,
  lockUnlockCollaborativeReview,
  reviewUser,
  updateReview,
  updateReviewerTeamMemberStatus,
}

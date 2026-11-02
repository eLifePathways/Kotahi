const { GraphQLError } = require('graphql')
const { config, subscriptionManager, withFilter } = require('@coko/server')

const {
  importManuscripts,
  archiveManuscripts,
  archiveManuscript,
  unarchiveManuscripts,
  assignAuthorForProofingManuscript,
  deleteManuscripts,
  deleteManuscript,
  reviewerResponse,
  updateManuscript,
  submitAuthorProofingFeedback,
  createNewVersion,
  submitManuscript,
  makeDecision,
  addReviewer,
  refreshAdaStatus,
  removeReviewer,
  setShouldPublishField,
  publishManuscript,
  getManuscript,
  manuscriptsUserHasCurrentRoleIn,
  manuscripts,
  publishedManuscripts,
  paginatedManuscripts,
  manuscriptsPublishedSinceDate,
  publishedManuscript,
  unreviewedPreprints,
  doisToRegister,
  validateDOI,
  validateSuffix,
  getManuscriptsData,
  versionsOfManuscriptCurrentUserIsReviewerOf,
  getManuscriptFiles,
  getManuscriptFilesForRequest,
  getRelatedPublishedArtifacts,
  getRelatedReviews,
  authorFeedback,
  manuscriptChannels,
  firstVersionCreated,
  manuscriptInvitations,
  manuscriptVersions,
  manuscriptSubmitter,
  manuscriptTasks,
  manuscriptTeams,
  getCss,
  publishedManuscriptDecisions,
  publishedManuscriptEditors,
  printReadyPdfUrl,
  publishedManuscriptReviews,
  styledHtml,
  submissionWithFields,
  supplementaryFiles,
  updateAda,
  metaSource,
  removeAuthor,
} = require('../../../controllers/manuscript/manuscript.controllers')

const {
  createManuscriptFromFile,
  getNewSubmissionSettings,
  NewSubmissionError,
} = require('../../../controllers/manuscript/newSubmission.controllers')

const { getRequestLoaders } = require('../requestLoaders')

// turns graphql upload into a web-standard File for the controllers to work with
const uploadToFile = async upload => {
  const { createReadStream, filename, mimetype } = await upload
  const maxSizeMb = config.get('manuscripts.maxUploadSizeMb')
  const chunks = []
  let size = 0

  for await (const chunk of createReadStream()) {
    size += chunk.length

    if (size > maxSizeMb * 1024 * 1024) {
      throw new GraphQLError(`${filename} is larger than ${maxSizeMb} MB`, {
        extensions: { code: 'FILE_TOO_LARGE' },
      })
    }

    chunks.push(chunk)
  }

  return new File(chunks, filename, { type: mimetype })
}

const manuscriptAndPublishedManuscriptSharedResolvers = {
  async files(parent, _, ctx) {
    if (parent.files) return getManuscriptFiles(parent.id, parent.files)
    return getManuscriptFilesForRequest(ctx, parent.id)
  },

  async meta(parent) {
    return {
      ...(parent.meta || {}),
      manuscriptId: parent.id,
      manuscriptFiles: parent.files, // For use by sub-resolvers only. Not part of return value.
    }
  },

  async publishedArtifacts(parent, _, ctx) {
    return getRelatedPublishedArtifacts(parent, ctx.userId)
  },

  /** We want submission info to come out as a stringified JSON, so that we don't have to
   * change our queries if the submission form changes. We still want to store it as JSONB
   * so that we can easily search through the information within. */
  submission(parent) {
    return JSON.stringify(parent.submission)
  },
}

const resolvers = {
  Mutation: {
    async createSubmission(_, { groupId, file, operationId }, ctx) {
      const onProgress = operationId
        ? step =>
            subscriptionManager.publish(
              `NEW_SUBMISSION_PROGRESS.${operationId}`,
              { userId: ctx.userId, step },
            )
        : undefined

      try {
        return await createManuscriptFromFile(
          ctx.userId,
          groupId,
          file && (await uploadToFile(file)),
          { onProgress },
        )
      } catch (error) {
        if (error instanceof NewSubmissionError) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.code },
          })
        }

        throw error
      }
    },

    async importManuscripts(_, { groupId }, ctx) {
      return importManuscripts(groupId, ctx)
    },

    async archiveManuscripts(_, { ids }) {
      return archiveManuscripts(ids)
    },

    async unarchiveManuscripts(_, { ids }) {
      return unarchiveManuscripts(ids)
    },

    async archiveManuscript(_, { id }) {
      return archiveManuscript(id)
    },

    async assignAuthorForProofingManuscript(_, { id }, ctx) {
      return assignAuthorForProofingManuscript(id, ctx.userId)
    },

    async deleteManuscripts(_, { ids }) {
      return deleteManuscripts(ids)
    },

    async deleteManuscript(_, { id }) {
      return deleteManuscript(id)
    },

    // TODO Rename to something like 'setReviewerResponse'
    async reviewerResponse(_, { action, teamId }, ctx) {
      return reviewerResponse(action, teamId, ctx.userId)
    },

    async updateManuscript(_, { id, input }) {
      return updateManuscript(id, input)
    },

    async submitAuthorProofingFeedback(_, { id, input }, ctx) {
      return submitAuthorProofingFeedback(id, input, ctx.userId)
    },

    async createNewVersion(_, { id }) {
      return createNewVersion(id)
    },

    async submitManuscript(_, { id, input }, ctx) {
      return submitManuscript(id, input, ctx.userId)
    },

    async makeDecision(_, { id, decision: decisionKey }, ctx) {
      return makeDecision(id, decisionKey, ctx.userId)
    },

    async addReviewer(
      _,
      { manuscriptId, userId, invitationId, isCollaborative },
    ) {
      return addReviewer(manuscriptId, userId, invitationId, isCollaborative)
    },

    async removeReviewer(_, { manuscriptId, userId }) {
      return removeReviewer(manuscriptId, userId)
    },

    async removeAuthor(_, { manuscriptId, userId }) {
      return removeAuthor(manuscriptId, userId)
    },
    async setShouldPublishField(
      _,
      { manuscriptId, objectId, fieldName, shouldPublish },
    ) {
      return setShouldPublishField(
        manuscriptId,
        objectId,
        fieldName,
        shouldPublish,
      )
    },

    async publishManuscript(_, { id }, ctx) {
      return publishManuscript(id, ctx.req.headers['group-id'])
    },

    async updateAda(_, { id, adaState }) {
      return updateAda(id, adaState)
    },

    async refreshAdaStatus(_, { id }) {
      return refreshAdaStatus(id)
    },
  },
  Subscription: {
    manuscriptsImportStatus: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(['IMPORT_MANUSCRIPTS_STATUS'])
      },
    },
    newSubmissionProgress: {
      subscribe: withFilter(
        (_, { operationId }) =>
          subscriptionManager.asyncIterator([
            `NEW_SUBMISSION_PROGRESS.${operationId}`,
          ]),
        (payload, _, ctx) => payload.userId === ctx.userId,
      ),
      resolve: payload => payload.step,
    },
  },
  Query: {
    async manuscript(_, { id }) {
      return getManuscript(id)
    },

    newSubmissionSettings() {
      return getNewSubmissionSettings()
    },

    async manuscriptsUserHasCurrentRoleIn(
      _,
      {
        reviewerStatus,
        wantedRoles,
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        groupId,
        searchInAllVersions,
      },
      ctx,
    ) {
      return manuscriptsUserHasCurrentRoleIn(
        reviewerStatus,
        wantedRoles,
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        groupId,
        searchInAllVersions,
        ctx.userId,
      )
    },

    async manuscripts() {
      return manuscripts()
    },

    async publishedManuscripts(_, { sort, offset, limit, groupId }) {
      return publishedManuscripts(sort, offset, limit, groupId)
    },

    async paginatedManuscripts(
      _,
      {
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        archived,
        groupId,
      },
      ctx,
    ) {
      const groupIdFromHeader = ctx.req.headers['group-id']
      const finalGroupId = groupId || groupIdFromHeader

      return paginatedManuscripts(
        sort,
        offset,
        limit,
        filters,
        timezoneOffsetMinutes,
        archived,
        finalGroupId,
      )
    },

    async manuscriptsPublishedSinceDate(
      _,
      { startDate, limit, offset, groupName },
      ctx,
    ) {
      return manuscriptsPublishedSinceDate(
        startDate,
        limit,
        offset,
        groupName,
        ctx.req.headers['group-id'],
      )
    },

    async publishedManuscript(_, { id }) {
      return publishedManuscript(id)
    },

    async unreviewedPreprints(_, { token, groupName = null }) {
      return unreviewedPreprints(token, groupName)
    },

    async doisToRegister(_, { id }) {
      return doisToRegister(id)
    },

    async validateDOI(_, { doiOrUrl }) {
      return validateDOI(doiOrUrl)
    },

    async validateSuffix(_, { suffix, groupId }) {
      return validateSuffix(suffix, groupId)
    },

    async getManuscriptsData(_, { selectedManuscripts }) {
      return getManuscriptsData(selectedManuscripts)
    },

    /** Return all version IDs for which the current user is assigned as a reviewer */
    async versionsOfManuscriptCurrentUserIsReviewerOf(
      _,
      { manuscriptId },
      ctx,
    ) {
      return versionsOfManuscriptCurrentUserIsReviewerOf(
        manuscriptId,
        ctx.userId,
      )
    },
  },
  Manuscript: {
    ...manuscriptAndPublishedManuscriptSharedResolvers,
    async authorFeedback(parent) {
      return authorFeedback(parent)
    },

    async channels(parent) {
      return manuscriptChannels(parent)
    },

    async firstVersionCreated(parent) {
      return firstVersionCreated(parent)
    },

    async invitations(parent) {
      return manuscriptInvitations(parent)
    },

    async manuscriptVersions(parent) {
      return manuscriptVersions(parent)
    },

    async reviews(parent, _, ctx) {
      return getRelatedReviews(parent, ctx.userId, false, { ctx })
    },

    async submitter(parent) {
      return manuscriptSubmitter(parent)
    },

    async tasks(parent) {
      return manuscriptTasks(parent)
    },

    async teams(parent) {
      return manuscriptTeams(parent)
    },
  },
  PublishedManuscript: {
    ...manuscriptAndPublishedManuscriptSharedResolvers,
    async files(parent, _, ctx) {
      const options = { onlyImagesUsedInSource: parent.meta?.source }

      if (parent.files)
        return getManuscriptFiles(parent.id, parent.files, options)

      return getManuscriptFilesForRequest(ctx, parent.id, options)
    },

    async css() {
      return getCss()
    },

    async decisions(parent, _, ctx) {
      return publishedManuscriptDecisions(parent, ctx.userId, { ctx })
    },

    async editors(parent) {
      return publishedManuscriptEditors(parent)
    },

    async printReadyPdfUrl(parent) {
      return printReadyPdfUrl(parent)
    },

    async publishedDate(parent) {
      return parent.published
    },

    async reviews(parent, _, ctx) {
      return publishedManuscriptReviews(parent, ctx.userId, { ctx })
    },

    async styledHtml(parent) {
      return styledHtml(parent)
    },

    async submissionWithFields(parent) {
      return submissionWithFields(parent)
    },

    async supplementaryFiles(parent) {
      return supplementaryFiles(parent)
    },

    // Since we can not change the api response structure right now
    // So Adding the totalCount field in the manuscript itself.
    async totalCount(parent) {
      return parent.totalcount
    },
  },
  ManuscriptMeta: {
    async source(parent, _, ctx) {
      return metaSource(parent, ctx)
    },
    async comments(parent) {
      return JSON.stringify(parent.comments)
    },
  },
  PublishedReview: {
    async users(review, _, ctx) {
      if (review.isHiddenReviewerName) {
        return [{ id: '', username: 'Anonymous User' }]
      }

      return getRequestLoaders(ctx).reviewUsers.load(review)
    },
  },
  ReviewUser: {
    // Published reviews are public, so never expose the reviewer's email
    async defaultIdentity(user, _, ctx) {
      if (!user.id) return null

      const identity = await getRequestLoaders(ctx).defaultIdentities.load(
        user.id,
      )

      return identity && { ...identity, email: null }
    },
  },
}

module.exports = resolvers

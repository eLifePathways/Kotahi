const { subscriptionManager } = require('@coko/server')

const {
  createManuscript,
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
  publishedReviewUsers,
  removeAuthor,
} = require('../../../controllers/manuscript/manuscript.controllers')

const manuscriptAndPublishedManuscriptSharedResolvers = {
  async files(parent) {
    return getManuscriptFiles(parent.id, parent.files)
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
    async createManuscript(_, vars, ctx) {
      return createManuscript(ctx.userId, vars.input)
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

    async updateAda(_, { id, adaState }, ctx) {
      return updateAda(id, adaState)
    },

    async refreshAdaStatus(_, { id }, ctx) {
      return refreshAdaStatus(id)
    },
  },
  Subscription: {
    manuscriptsImportStatus: {
      subscribe: async (_, vars, context) => {
        return subscriptionManager.asyncIterator(['IMPORT_MANUSCRIPTS_STATUS'])
      },
    },
  },
  Query: {
    async manuscript(_, { id }) {
      return getManuscript(id)
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

    async publishedManuscripts(_, { sort, offset, limit, groupId }, ctx) {
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
      return getRelatedReviews(parent, ctx.userId)
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
    async css(parent) {
      return getCss()
    },

    async decisions(parent, { _ }, ctx) {
      return publishedManuscriptDecisions(parent, ctx.userId)
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

    async reviews(parent, { _ }, ctx) {
      return publishedManuscriptReviews(parent, ctx.userId)
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
    async source(parent) {
      return metaSource(parent)
    },
    async comments(parent) {
      return JSON.stringify(parent.comments)
    },
  },
  PublishedReview: {
    async users(parent) {
      return publishedReviewUsers(parent)
    },
  },
}

module.exports = resolvers

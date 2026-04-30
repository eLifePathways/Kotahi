const { authorization } = require('@coko/server')

const { File } = require('@coko/server')
const { cachedGet } = require('./services/queryCache.service')

const Channel = require('./models/channel/channel.model')
const Config = require('./models/config/config.model')
const Message = require('./models/message/message.model')
const Manuscript = require('./models/manuscript/manuscript.model')
const Review = require('./models/review/review.model')
const Team = require('./models/team/team.model')
const TeamMember = require('./models/teamMember/teamMember.model')
const User = require('./models/user/user.model')

// Shield's `race` rule is misnamed, as it doesn't race the different rules but applies them sequentially until one succeeds. `or`, on the other hand, applies all rules in parallel.
const { rule, and, or, allow, deny, race: lazyOr } = authorization

const userIsEditor = rule({
  cache: 'strict',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  const manuscriptId = parent?.manuscriptId ?? args?.id
  if (!manuscriptId) throw new Error('No manuscriptId for userIsEditor!')
  return cachedGet(`userIsEditor:${ctx.userId}:${manuscriptId}`)
})

// TODO Is this actually needed anywhere? Can it be replaced with userIsEditor?
const userIsEditorOfAnyManuscript = rule({
  cache: 'contextual',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  return cachedGet(`userIsEditorOfAnyManuscript:${ctx.userId}`)
})

const userIsGm = rule({
  cache: 'contextual',
})(async (parent, args, ctx) => {
  const groupId = ctx.req.headers['group-id']
  // An 'undefined' groupId header can occasionally be obtained, especially
  // in development. If we don't deal with it gracefully, it will cause
  // a crash and prevent its replacement with a correct value.
  if (!ctx.userId || !groupId || groupId === 'undefined') return false
  return cachedGet(`userIsGM:${ctx.userId}:${groupId}`)
})

const userIsAdmin = rule({
  cache: 'contextual',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  return cachedGet(`userIsAdmin:${ctx.userId}`)
})

const userIsGroupAdmin = rule({
  cache: 'contextual',
})(async (parent, args, ctx) => {
  const groupId = ctx.req.headers['group-id']
  if (!ctx.userId || !groupId || groupId === 'undefined') return false
  return cachedGet(`userIsGroupAdmin:${ctx.userId}:${groupId}`)
})

const userOwnsMessage = rule({ cache: 'contextual' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  const message = await Message.query().findById(args.messageId)

  return message?.userId === ctx.userId
})

const getLatestVersionOfManuscriptOfFile = async (file, ctx) => {
  const manuscript = await cachedGet(`msOfFile:${file.id}`)

  if (!manuscript) return null

  const firstVersionId = manuscript.parentId || manuscript.id
  const latestVersion = await getLatestVersionOfManuscript(ctx, firstVersionId)

  return latestVersion
}

const getLatestVersionOfManuscript = async (ctx, manuscriptVersionId) => {
  const latestVersion = await Manuscript.query()
    .where({ parentId: manuscriptVersionId })
    .orWhere({ id: manuscriptVersionId })
    .orderBy('created', 'desc')
    .limit(1)

  return latestVersion[0]
}

const userIsMemberOfTeamWithRoleQuery = async (user, manuscriptId, role) => {
  if (!user) return false

  const query = user
    .$relatedQuery('teams')
    .where({ role })
    .andWhere({ objectId: manuscriptId, objectType: 'manuscript' })

  const rows = await query.resultSize()
  return !!rows
}

const isPublicFileFromPublishedManuscript = rule({ cache: 'strict' })(
  async parent => {
    if (parent.tags && parent.tags.includes('confidential')) return false
    const manuscript = await cachedGet(`msOfFile:${parent.id}`)
    return !!manuscript?.published
  },
)

const isCMSFile = rule({ cache: 'strict' })(async parent => {
  return parent.tags && parent.tags.includes('cms')
})

const isPublishingCollection = rule({ cache: 'strict' })(async parent => {
  return parent.tags && parent.tags.includes('publishingCollection')
})

const isLogoFile = rule({ cache: 'strict' })(async parent => {
  return parent.tags && parent.tags.includes('brandLogo')
})

const isFaviconFile = rule({ cache: 'strict' })(async parent => {
  return parent.tags && parent.tags.includes('favicon')
})

const isExportTemplatingFile = rule({ cache: 'strict' })(async parent => {
  return parent.tags && parent.tags.includes('templateGroupAsset')
})

const isPublicReviewFromPublishedManuscript = rule({ cache: 'strict' })(
  async parent => {
    if (parent.isHiddenFromAuthor || !parent.manuscriptId) return false

    // TODO Check that all confidential fields have been stripped out. Otherwise return false.

    const manuscript = await Manuscript.query().findById(parent.manuscriptId)

    return !!(manuscript && manuscript.published)
  },
)

// TODO This appears only to check if the user is a reviewer of ANY manuscript!??
const reviewIsByUser = rule({ cache: 'contextual' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  const user = await User.query().findById(ctx.userId)

  const rows =
    user && user.$relatedQuery('teams').where({ role: 'reviewer' }).resultSize()

  return !!rows
})

const isAuthenticated = rule({ cache: 'contextual' })(async (
  parent,
  args,
  ctx,
) => {
  return !!ctx.userId
})

// Who can send a message to a channel?
// Configured like so now:
// if the channel is for 'all', then all associated with the manuscript can create messages
// if the channel is for 'editorial', only editors and admins can chat there
const userIsAllowedToChat = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  const isUserGM = await cachedGet(
    `userIsGM:${ctx.userId}:${ctx.req.headers['group-id']}`,
  )

  if (isUserGM) return true

  const isUserGroupAdmin = await cachedGet(
    `userIsGroupAdmin:${ctx.userId}:${ctx.req.headers['group-id']}`,
  )

  if (isUserGroupAdmin) return true

  const isUserAdmin = await cachedGet(`userIsAdmin:${ctx.userId}`)
  if (isUserAdmin) return true

  const user = await User.query().findById(ctx.userId)

  const channel = await Channel.query().findById(args.channelId)

  /**
   * Chat channels are always associated with the parent manuscript
   * but we allow different teams to work on different versions.
   * Therefore, authorization is based on the latest version of the manuscript.
   */

  const manuscript = await getLatestVersionOfManuscript(
    ctx,
    channel.manuscriptId,
  )

  const isAuthor = await userIsMemberOfTeamWithRoleQuery(
    user,
    manuscript.id,
    'author',
  )

  const isReviewer = await userIsMemberOfTeamWithRoleQuery(
    user,
    manuscript.id,
    'reviewer',
  )

  const isEditor = await cachedGet(
    `userIsEditor:${ctx.userId}:${manuscript.id}`,
  )

  if (channel.type === 'all') {
    return isAuthor || isReviewer || isEditor
  }

  if (channel.type === 'editorial') {
    return isReviewer || isEditor
  }

  return false
})

const userIsReviewAuthorAndReviewIsNotCompleted = rule({
  cache: 'strict',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  let manuscriptId

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input && args.input.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  const manuscript = await Manuscript.query().findById(manuscriptId)

  const teams = await Team.query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
    })
    .andWhere(builder => {
      builder.whereIn('role', ['reviewer', 'collaborativeReviewer'])
    })

  if (!teams) return false

  const member = await TeamMember.query()
    .whereIn(
      'teamId',
      teams.map(t => t.id),
    )
    .andWhere(builder => {
      builder.where({ userId: ctx.userId })
    })
    .first()

  if (member && member.status !== 'completed') return true
  return false
})

const userIsEditorOfTheManuscriptOfTheReview = rule({
  cache: 'strict',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  let manuscriptId

  // updateReviewerTeamMemberStatus
  if (args.manuscriptId) manuscriptId = args.manuscriptId

  // updateReview
  if (!manuscriptId && args.id) {
    const review = await Review.query().findById(args.id)
    if (review) manuscriptId = review.manuscriptId
  }

  // updateReview DecisionForm fallback
  if (!manuscriptId && args.input?.manuscriptId) {
    manuscriptId = args.input.manuscriptId
  }

  return cachedGet(`userIsEditor:${ctx.userId}:${manuscriptId}`)
})

const userIsReviewerOrInvitedReviewerOfTheManuscript = rule({
  cache: 'strict',
})(async (parent, args, ctx) => {
  if (!ctx.userId || !args.id) return false

  const parentId = (
    await Manuscript.query().findById(args.id).select('parentId')
  )?.parentId

  const reviewerStatuses = await Manuscript.query()
    .where(builder =>
      builder.where('manuscripts.id', parentId).orWhere({ parentId }),
    )
    .joinRelated('teams')
    .join('team_members', 'team_members.teamId', 'teams.id') // joinRelated doesn't automate the 'teams.members' relation well, so we do it manually
    .whereIn('teams.role', ['reviewer', 'collaborativeReviewer'])
    .where('team_members.userId', ctx.userId)
    .select('team_members.status')

  return !!reviewerStatuses.length
})

const userIsInvitedReviewer = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  const team = await Team.query().findById(args.teamId)

  const member = await team
    .$relatedQuery('members')
    .where({ userId: ctx.userId, status: 'invited' })
    .first()

  return !!member
})

const userHasAcceptedInvitation = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  const teamMember = await TeamMember.query()
    .where({ userId: ctx.userId, teamId: args.teamId })
    .whereIn('status', ['accepted', 'inProgress', 'completed'])
    .first()

  return !!teamMember
})

const userIsAuthorOfManuscript = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId || !args.id) return false

  const authorRecord = await Team.relatedQuery('members')
    .for(Team.query().where({ objectId: args.id, role: 'author' }))
    .findOne({ userId: ctx.userId })

  return !!authorRecord
})

// const userIsAuthorOfFilesAssociatedManuscript = rule({
//   cache: 'no_cache',
// })(async (parent, args, ctx, info) => {
//   if (!ctx.userId) return false
//   let manuscriptId

//   if (args.meta && args.meta.manuscriptId) {
//     // Meta is supplied for createFile
//     // eslint-disable-next-line prefer-destructuring
//     manuscriptId = args.meta.manuscriptId
//   } else if (args.id) {
//     // id is supplied for deletion
//     const file = await File.query().findById(args.id)
//     const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
//     manuscriptId = manuscript && manuscript.id
//   }

//   if (!manuscriptId) return false

//   const team = await Team
//     .query()
//     .where({
//       objectId: manuscriptId,
//       objectType: 'manuscript',
//       role: 'author',
//     })
//     .first()

//   if (!team) return false
//   const members = await team.$relatedQuery('members').where('userId', ctx.userId)
//   if (members && members[0]) return true
//   return false
// })

const userIsAuthorOfTheManuscriptOfTheFile = rule({ cache: 'strict' })(async (
  file,
  args,
  ctx,
) => {
  if (!ctx.userId) return false

  if (file.storedObjects && !file.id) return true // only on uploading manuscript docx this will be validated

  const manuscript = await cachedGet(`msOfFile:${file.id}`, ctx)
  if (!manuscript) return false

  const team = await Team.query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
    })
    .first()

  if (!team) return false

  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.userId)

  if (members && members[0]) return true
  return false
})

// ¯\_(ツ)_/¯
const userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete = rule({
  cache: 'strict',
})(async (parent, args, ctx) => {
  if (!ctx.userId) return false
  if (!parent.id) return false

  const file = await File.query().findById(parent.id)
  const manuscript = await getLatestVersionOfManuscriptOfFile(file, ctx)
  if (!manuscript) return false

  const team = await Team.query()
    .where({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'reviewer',
    })
    .first()

  if (!team) return false

  const members = await team
    .$relatedQuery('members')
    .where('userId', ctx.userId)

  if (members && members[0] && members[0].status !== 'completed') return true
  return false
})

const manuscriptIsPublished = rule({
  cache: 'strict',
})(async (parent, args) => {
  const manuscript = await Manuscript.query()
    .select('published')
    .findById(args.id)

  return !!manuscript.published
})

const userIsCurrentUser = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  if (!ctx.userId || !args.id) return false
  return ctx.userId === args.id
})

const isForManuscriptsPublishedSinceDateQuery = rule()(async (
  parent,
  args,
  ctx,
  info,
) => {
  let { path } = info

  while (path) {
    if (path.key === 'manuscriptsPublishedSinceDate') return true
    path = path.prev
  }

  return false
})

/**
 * Only the following users may publish:
 * - a group admin, OR
 * - an editor AND the control panel config allows, OR
 * - a group manager AND the control panel config allows
 */
const userCanPublishManuscript = rule({ cache: 'strict' })(async (
  parent,
  args,
  ctx,
) => {
  const groupId = ctx.req.headers['group-id']
  if (!ctx.userId || !groupId || groupId === 'undefined') return false
  const manuscriptId = parent?.manuscriptId ?? args?.id
  if (!manuscriptId)
    throw new Error('No manuscriptId for userCanPublishManuscript!')

  const activeConfig = await Config.query().findOne({
    groupId,
    active: true,
  })

  const isGroupAdmin = await cachedGet(
    `userIsGroupAdmin:${ctx.userId}:${groupId}`,
  )

  const isEditor = await cachedGet(`userIsEditor:${ctx.userId}:${manuscriptId}`)

  const isGm = await cachedGet(`userIsGM:${ctx.userId}:${groupId}`)

  return (
    isGroupAdmin ||
    (isEditor && activeConfig?.formData.controlPanel.editorsCanPublish) ||
    (isGm && activeConfig?.formData.controlPanel.groupManagersCanPublish)
  )
})

const permissions = {
  Query: {
    authorsActivity: or(userIsGroupAdmin, userIsAdmin),
    builtCss: isAuthenticated,
    config: isAuthenticated,
    convertToJats: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    convertToPdf: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    currentUser: isAuthenticated,
    docmap: allow,
    editorsActivity: or(userIsGroupAdmin, userIsAdmin),
    file: deny, // Never used
    files: deny, // Never used
    form: isAuthenticated,
    formForPurposeAndCategory: allow,
    forms: allow,
    formsByCategory: or(userIsGroupAdmin, userIsAdmin),
    getBlacklistInformation: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    getEntityFiles: isAuthenticated,
    getInvitationsForManuscript: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    getFilesByTagOrId: allow,
    getSpecificFiles: isAuthenticated,
    globalTeams: deny, // Never used
    group: allow,
    groups: allow,
    invitationManuscriptId: isAuthenticated,
    invitationStatus: allow,
    manuscript: or(
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
      manuscriptIsPublished,
      userIsEditor,
      userIsAuthorOfManuscript,
      userIsReviewerOrInvitedReviewerOfTheManuscript,
    ),
    manuscripts: isAuthenticated,
    manuscriptsActivity: or(userIsGroupAdmin, userIsAdmin),
    manuscriptsPublishedSinceDate: allow,
    manuscriptsUserHasCurrentRoleIn: isAuthenticated,
    message: deny, // Never used
    messages: isAuthenticated,
    orcidValidate: isAuthenticated,
    paginatedManuscripts: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    paginatedUsers: or(userIsGroupAdmin, userIsAdmin),
    publishedArtifacts: allow,
    publishedManuscript: allow,
    publishedManuscripts: allow,
    publishingCollection: allow,
    reviewersActivity: or(userIsGroupAdmin, userIsAdmin),
    searchRor: allow,
    searchUsers: isAuthenticated,
    summaryActivity: or(userIsGroupAdmin, userIsAdmin),
    systemWideDiscussionChannel: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    tasks: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    team: deny, // Never used
    teams: isAuthenticated,
    threadedDiscussions: isAuthenticated,
    unreviewedPreprints: allow, // This has its own token-based authentication.
    user: isAuthenticated,
    userHasTaskAlerts: isAuthenticated,
    users: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    validateDOI: isAuthenticated,
    validateSuffix: isAuthenticated,
    versionsOfManuscriptCurrentUserIsReviewerOf: allow,
    events: or(userIsGm, userIsGroupAdmin, userIsAdmin),
  },
  Mutation: {
    addEmailToBlacklist: allow, // TODO scrap this mutation and trigger its action inside updateInvitationResponse
    addReviewer: isAuthenticated,
    archiveManuscript: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    archiveManuscripts: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    assignTeamEditor: deny, // Never used
    assignUserAsAuthor: isAuthenticated, // TODO require the invitation ID to be sent in this mutation
    completeComment: isAuthenticated,
    completeComments: isAuthenticated,
    // createDocxToHTMLJob seems to be exposed from xsweet???
    createFile: isAuthenticated,
    createForm: or(userIsGroupAdmin, userIsAdmin),
    createCollection: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    createManuscript: isAuthenticated,
    createMessage: userIsAllowedToChat,
    createNewTaskAlerts: or(userIsGm, userIsGroupAdmin, userIsAdmin), // Only used when test code is enabled
    createNewVersion: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    createTeam: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ), // TODO scrap this mutation in favour of an 'assignEditor' mutation
    deleteCollection: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    deleteFile: isAuthenticated,
    deleteFiles: isAuthenticated,
    deleteForm: or(userIsGroupAdmin, userIsAdmin),
    deleteFormElement: or(userIsGroupAdmin, userIsAdmin),
    deleteManuscript: deny, // Never used
    deleteManuscripts: deny, // Never used
    deletePendingComment: isAuthenticated,
    deleteUser: or(userIsGroupAdmin, userIsAdmin),
    deleteMessage: or(
      userOwnsMessage,
      and(userIsGm, userIsGroupAdmin, userIsAdmin),
    ),
    importManuscripts: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    makeDecision: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    publishManuscript: userCanPublishManuscript,
    refreshAdaStatus: or(userIsAdmin, userIsEditor, userIsGm, userIsGroupAdmin),
    removeAuthor: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    removeReviewer: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    removeTaskAlertsForCurrentUser: isAuthenticated,
    reviewerResponse: or(userIsInvitedReviewer, userHasAcceptedInvitation),
    sendEmail: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    setGlobalRole: userIsAdmin,
    setGroupRole: or(userIsGroupAdmin, userIsAdmin),
    setShouldPublishField: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    submitManuscript: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    submitAuthorProofingFeedback: userIsAuthorOfManuscript,
    unarchiveManuscripts: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    updateAda: or(userIsAdmin, userIsEditor, userIsGm, userIsGroupAdmin),
    updateCollection: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    updateEmail: or(userIsCurrentUser, userIsGm, userIsGroupAdmin, userIsAdmin),
    updateConfig: or(userIsGroupAdmin, userIsAdmin),
    updateUsername: or(
      userIsCurrentUser,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateFile: isAuthenticated,
    updateForm: or(userIsGroupAdmin, userIsAdmin),
    updateFormElement: or(userIsGroupAdmin, userIsAdmin),
    updateInvitationResponse: allow,
    updateInvitationStatus: allow,
    updateManuscript: or(
      userIsAuthorOfManuscript,
      userIsEditor,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updatePendingComment: isAuthenticated,
    updateReview: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
      userIsEditorOfAnyManuscript, // Probably not needed, but just in case
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateTask: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateTasks: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateTaskNotification: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateTeam: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateTeamMember: or(
      userIsEditorOfAnyManuscript,
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
    ),
    updateReviewerTeamMemberStatus: or(
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    lockUnlockCollaborativeReview: or(
      userIsGm,
      userIsGroupAdmin,
      userIsAdmin,
      userIsReviewAuthorAndReviewIsNotCompleted,
      userIsEditorOfTheManuscriptOfTheReview,
    ),
    updateUser: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    uploadFile: isAuthenticated,
    uploadFiles: isAuthenticated,
    updateTaskStatus: isAuthenticated,
    updateCMSPage: or(userIsGroupAdmin, userIsAdmin),
    createCMSPage: or(userIsGroupAdmin, userIsAdmin),
    deleteCMSPage: or(userIsGroupAdmin, userIsAdmin),
    updateCMSLayout: or(userIsGroupAdmin, userIsAdmin),
    rebuildFlaxSite: or(userIsGroupAdmin, userIsAdmin),
    updateMessage: or(userOwnsMessage, userIsGm, userIsGroupAdmin, userIsAdmin),
    createNotification: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    updateNotification: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    deleteNotification: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    setNotificationActive: or(userIsGm, userIsGroupAdmin, userIsAdmin),
    setEventActive: or(userIsGm, userIsGroupAdmin, userIsAdmin),
  },
  Subscription: {
    fileUpdated: isAuthenticated,
    filesDeleted: isAuthenticated,
    filesUploaded: isAuthenticated,
    reviewFormUpdated: isAuthenticated,
    manuscriptsImportStatus: isAuthenticated,
    /**
     * This was not being triggered at all before the v3 upgrade.
     * It doesn't work because userIsAllowedToChat dependends on req, and req
     * is not in the context for subscriptions.
     */
    // messageCreated: userIsAllowedToChat,
    messageCreated: isAuthenticated,
  },
  CurrentRole: isAuthenticated,
  Team: isAuthenticated,
  TeamMember: isAuthenticated,
  User: isAuthenticated,
  Group: allow,
  Config: allow,
  PaginatedManuscripts: allow,
  Manuscript: allow,
  File: lazyOr(
    isForManuscriptsPublishedSinceDateQuery,
    isExportTemplatingFile,
    isCMSFile,
    isPublishingCollection,
    isLogoFile,
    isFaviconFile,
    isPublicFileFromPublishedManuscript,
    userIsAuthorOfTheManuscriptOfTheFile,
    userIsTheReviewerOfTheManuscriptOfTheFileAndReviewNotComplete,
    userIsEditorOfAnyManuscript,
    reviewIsByUser,
    userIsGm,
    userIsAdmin,
  ),
  FileNotInDb: allow,
  Form: allow,
  FormStructure: allow,
  FormElement: allow,
  FormElementOption: allow,
  FormElementValidation: allow,
  Review: or(
    isPublicReviewFromPublishedManuscript,
    reviewIsByUser,
    userIsEditorOfAnyManuscript,
    userIsGm,
    userIsGroupAdmin,
    userIsAdmin,
  ),
  Channel: isAuthenticated,
  Message: isAuthenticated,
  MessagesRelay: isAuthenticated,
  PageInfo: isAuthenticated,
  ManuscriptMeta: allow,
  Note: isAuthenticated,
  Identity: isAuthenticated,
  PublishedManuscript: allow,
}

module.exports = permissions

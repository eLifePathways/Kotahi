// #region import
const { chunk, orderBy, uniqBy, flatten } = require('lodash')
const { ref, raw } = require('objection')
const axios = require('axios')

const { File, useTransaction } = require('@coko/server')

const {
  CoarNotification,
  CollaborativeDoc,
  Config,
  Group,
  Manuscript,
  PublishedArtifact,
  Review: ReviewModel,
  Team,
  TeamMember,
  ThreadedDiscussion,
  User,
  Channel,
  Form,
} = require('../../models')

const {
  hasElifeStyleEvaluations,
  stripConfidentialDataFromReviews,
  buildQueryForManuscriptSearchFilterAndOrder,
  applyTemplatesToArtifacts,
} = require('./manuscriptUtils')

const { manuscriptHasOverdueTasksForUser } = require('./manuscriptCommsUtils')
const { getActiveForms } = require('../form.controllers')
const checkIsAbstractValueEmpty = require('../../utils/checkIsAbstractValueEmpty')
const { cachedGet } = require('../../services/queryCache.service')
const seekEvent = require('../../services/notification.service')
const sanitizeWaxImages = require('../../utils/sanitizeWaxImages')
const { publishToDatacite } = require('../../services/publishing/datacite')

const {
  publishToAda,
  getAdaJobStatus,
} = require('../../services/publishing/astromat-ada')

const { publishToDOAJ } = require('../../services/publishing/doaj')
const publishToGoogleSpreadSheet = require('../../services/publishing/google-spreadsheet')
const { tryPublishDocMaps } = require('../../services/publishing/docmaps')
const { rebuildCMSSite } = require('../flax.controllers')

const {
  sendAnnouncementNotification,
  sendRejectCoarNotification,
} = require('../coar/coar.controllers')

const { sendAnnouncementNotificationToSciety } = require('../coar/sciety')

const {
  getPublishableReviewFields,
  getPublishableSubmissionFields,
} = require('../../services/publishing/flax/tools')

const {
  deepMergeObjectsReplacingArrays,
  objIf,
} = require('../../utils/objectUtils')

const validateApiToken = require('../../utils/validateApiToken')

const {
  populateTemplatedTasksForManuscript,
  deleteAlertsForManuscript,
} = require('../task.controllers')

const {
  addUserToManuscriptChatChannel,
  removeUserFromManuscriptChatChannel,
} = require('../channel.controllers')

const {
  importManuscripts: importManuscriptsBase,
  importManuscriptsFromSemanticScholar,
} = require('./importManuscripts')

const {
  getThreadedDiscussionsForManuscript,
} = require('../threadedDiscussion.controllers')

const {
  publishToHypothesis,
  deletePublication,
} = require('../../services/publishing/hypothesis')

const {
  publishToCrossref,
  getReviewOrSubmissionField,
  getDoi,
  doiIsAvailable,
  doiExists,
} = require('../../services/publishing/crossref')

const {
  getFilesWithUrl,
  replaceImageSrc,
  replaceImageSrcResponsive,
} = require('../../utils/fileStorageUtils')

const {
  convertFilesToFullObjects,
  getReviewForm,
  getDecisionForm,
  getSubmissionForm,
} = require('../review.controllers')

const {
  getUsersById,
  getUserRolesInManuscript,
  getSharedReviewersIds,
} = require('../user.controllers')

const { applyTemplate, generateCss } = require('../../utils/applyTemplate')
const { decrypt } = require('../../utils/encryptDecryptUtils')
const { usersLoader } = require('../../models/review/review.loaders')
const { defaultIdentitiesLoader } = require('../../models/user/user.loaders')

// #endregion import

const addReviewer = async (
  manuscriptId,
  userId,
  invitationId,
  isCollaborative,
) => {
  return Manuscript.addReviewer(
    manuscriptId,
    userId,
    invitationId,
    isCollaborative,
  )
}

const archiveManuscript = async id => {
  await deleteAlertsForManuscript(id)
  const manuscript = await Manuscript.findById(id)

  // getting the ID of the firstVersion for all manuscripts.
  const firstVersionId = manuscript.parentId || manuscript.id

  // Archive Manuscript
  const archivedManuscript = await Manuscript.query()
    .returning('id')
    .update({ isHidden: true })
    .where('id', firstVersionId)
    .orWhere('parentId', firstVersionId)

  return archivedManuscript[0].id
}

const archiveManuscripts = async ids => {
  await Promise.all(ids.map(id => deleteAlertsForManuscript(id)))

  // finding the ids of the first versions of all manuscripts:
  const selectedManuscripts = await Manuscript.query()
    .select('parentId', 'id')
    .whereIn('id', ids)

  const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

  // archiving manuscripts with either firstVersionID or parentID
  const archivedManuscripts = await Manuscript.query()
    .returning('id')
    .update({ isHidden: true })
    .whereIn('id', firstVersionIds)
    .orWhereIn('parentId', firstVersionIds)

  return archivedManuscripts.map(m => m.id)
}

const assignAuthorForProofingManuscript = async (manuscriptId, userId) => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .withGraphFetched('[channels]')

  const { groupId } = manuscript
  const author = await manuscript.getManuscriptAuthor()
  const authorName = author?.username || ''

  let assignedAuthors = []

  if (
    manuscript.authorFeedback.assignedAuthors &&
    manuscript.authorFeedback.assignedAuthors.length > 0
  ) {
    assignedAuthors = [...manuscript.authorFeedback.assignedAuthors]
  }

  assignedAuthors.push({
    authorId: author.id,
    authorName,
    assignedOnDate: new Date(),
  })

  const updated = await Manuscript.query().patchAndFetchById(manuscript.id, {
    status: 'assigned',
    authorFeedback: {
      ...manuscript.authorFeedback,
      assignedAuthors: orderBy(
        assignedAuthors,
        [obj => new Date(obj.assignedOnDate)],
        ['desc'],
      ),
    },
  })

  const receiverEmail = author.email
  const receiverName = authorName

  const emailValidationRegexp = /^[^\s@]+@[^\s@]+$/
  const emailValidationResult = emailValidationRegexp.test(receiverEmail)

  if (!emailValidationResult || !receiverName) {
    return updated
  }

  let channelId

  if (manuscript.parentId) {
    const channel = await Manuscript.relatedQuery('channels')
      .for(manuscript.parentId)
      .findOne({ topic: 'Editorial discussion' })

    channelId = channel.id
  } else {
    channelId = manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id
  }

  const messageContent = {
    content: `Author proof assigned Email sent by Kotahi to ${author.username}`,
    channelId,
    userId,
  }

  seekEvent('author-proofing-assign', {
    manuscript: updated,
    context: { recipient: receiverEmail, messageContent },
    groupId,
  })

  return updated
}

const authorFeedback = async manuscript => {
  if (manuscript.authorFeedback && manuscript.authorFeedback.submitterId) {
    const submitter = await User.query().findById(
      manuscript.authorFeedback.submitterId,
    )

    return {
      ...manuscript.authorFeedback,
      submitter,
    }
  }

  return manuscript.authorFeedback || {}
}

const createManuscript = async (userId, input) => {
  const { meta, files, groupId } = input
  const group = await Group.query().findById(groupId)
  if (!group)
    throw new Error(`Cannot create manuscript for unknown group ${groupId}`)
  const submissionForm = await getSubmissionForm(group.id)

  const parsedFormStructure = submissionForm.structure.children
    .map(formElement => {
      const parsedName = formElement.name && formElement.name.split('.')[1]

      if (parsedName) {
        return {
          name: parsedName,
          component: formElement.component,
        }
      }

      return undefined
    })
    .filter(x => x !== undefined)

  const emptySubmission = parsedFormStructure.reduce((acc, curr) => {
    acc[curr.name] =
      curr.component === 'CheckboxGroup' || curr.component === 'LinksInput'
        ? []
        : ''
    return {
      ...acc,
    }
  }, {})

  // We want the submission information to be stored as JSONB
  // but we want the input to come in as a JSON string
  const submission = input.submission
    ? JSON.parse(input.submission)
    : emptySubmission

  const emptyManuscript = {
    meta,
    status: 'new',
    submission,
    submitterId: userId,
    // Create two channels: 1. free for all involved, 2. editorial
    channels: [
      {
        topic: 'Manuscript discussion',
        type: 'all',
        groupId: group.id,
      },
      {
        topic: 'Editorial discussion',
        type: 'editorial',
        groupId: group.id,
      },
    ],
    files: files.map(file => {
      return {
        ...file,
      }
    }),
    reviews: [],
    teams: [
      {
        role: 'author',
        displayName: 'Author',
        members: [{ user: { id: userId } }],
        objectType: 'manuscript',
      },
    ],
    groupId: group.id,
    authorFeedback: {},
  }

  /* eslint-disable-next-line prefer-destructuring */
  emptyManuscript.submission.$editDate = new Date().toISOString().split('T')[0]

  const manuscript = await Manuscript.query().upsertGraphAndFetch(
    emptyManuscript,
    { relate: true },
  )

  manuscript.meta.source = await sanitizeWaxImages(
    manuscript.meta.source,
    manuscript.id,
  )

  const updatedManuscript = await Manuscript.query().updateAndFetchById(
    manuscript.id,
    manuscript,
  )

  // newly uploaded files get tasks populated
  await populateTemplatedTasksForManuscript(manuscript.id)

  // add user to author discussion channel
  await addUserToManuscriptChatChannel({
    manuscriptId: updatedManuscript.id,
    userId,
  })

  return updatedManuscript
}

const createNewVersion = async id => {
  const manuscript = await Manuscript.query().findById(id)

  seekEvent('manuscript-new-version', {
    manuscript,
    groupId: manuscript.groupId,
  })

  return manuscript.createNewVersion()
}

const deleteManuscript = async id => {
  const toDeleteList = []
  const manuscript = await Manuscript.findById(id)

  const activeConfig = await Config.getCached(manuscript.groupId)

  toDeleteList.push(manuscript.id)

  if (manuscript.parentId) {
    const parentManuscripts = await Manuscript.query().where({
      parent_id: manuscript.parentId,
    })

    parentManuscripts.forEach(ms => {
      toDeleteList.push(ms.id)
    })
  }

  // Delete all versions of manuscript
  await Promise.all(
    toDeleteList.map(async toDeleteItem => {
      if (activeConfig.formData.publishing.hypothesis.apiKey) {
        const hypothesisArtifacts = PublishedArtifact.query().where({
          manuscriptId: toDeleteItem,
          platform: 'Hypothesis',
        })

        const headers = {
          headers: {
            Authorization: `Bearer ${activeConfig.formData.publishing.hypothesis.apiKey}`,
          },
        }

        await Promise.all(
          hypothesisArtifacts.map(async artifact =>
            deletePublication(artifact.externalId, headers),
          ),
        )
      }

      Manuscript.query().deleteById(toDeleteItem)
    }),
  )

  return id
}

const deleteManuscripts = async ids => {
  if (ids.length > 0) {
    await Promise.all(
      ids.map(toDeleteItem => Manuscript.query().deleteById(toDeleteItem)),
    )
  }

  return ids
}

const doisToRegister = async id => {
  const manuscript = await Manuscript.query()
    .findById(id)
    .withGraphJoined('reviews')

  const activeConfig = await Config.getCached(manuscript.groupId)

  if (
    !activeConfig.formData.publishing.crossref.login ||
    !activeConfig.formData.publishing.crossref.doiPrefix
  ) {
    return null
  }

  const DOIs = []

  if (activeConfig.formData.publishing.crossref.publicationType === 'article') {
    try {
      const manuscriptDOI = await getDoi(
        getReviewOrSubmissionField(manuscript, '$doiSuffix') || manuscript.id,
        activeConfig,
      )

      if (manuscriptDOI) {
        DOIs.push(manuscriptDOI)
      }
    } catch (error) {
      console.error('Error while getting manuscript DOI:', error)
    }
  } else {
    const notEmptyReviews = Object.entries(manuscript.submission)
      .filter(
        ([key, value]) =>
          key.length === 7 &&
          key.includes('review') &&
          !checkIsAbstractValueEmpty(value),
      )
      .map(([key]) => key.replace('review', ''))

    DOIs.push(
      ...notEmptyReviews.map(async reviewNumber => {
        try {
          const reviewDOI = await getDoi(
            getReviewOrSubmissionField(
              manuscript,
              `review${reviewNumber}suffix`,
            ) || `${manuscript.id}/${reviewNumber}`,
            activeConfig,
          )

          return reviewDOI
        } catch (error) {
          console.error(
            `Error while getting review ${reviewNumber} DOI:`,
            error,
          )
          return null
        }
      }),
    )

    if (
      Object.entries(manuscript.submission).some(
        ([key, value]) =>
          key === 'summary' && !checkIsAbstractValueEmpty(value),
      )
    ) {
      try {
        const summaryDOI = await getDoi(
          getReviewOrSubmissionField(manuscript, 'summarysuffix') ||
            `${manuscript.id}/`,
          activeConfig,
        )

        if (summaryDOI) {
          DOIs.push(summaryDOI)
        }
      } catch (error) {
        console.error('Error while getting summary DOI:', error)
      }
    }
  }

  return DOIs
}

// Helper function to extract common manuscript or version data
const extractCommonData = item => ({
  created: item.created,
  updated: item.updated,
  status: item.status,
  decision: item.decision,
  submission: JSON.stringify(item.submission),
  importSourceServer: item.importSourceServer,
  shortId: item.shortId,
  teams: item.teams.map(team => ({ ...team })),
})

// Helper function to extract review and decision data
const extractReviewData = (reviews, isDecision) =>
  reviews
    .filter(review => review.isDecision === isDecision)
    .map(review => ({
      created: review.created,
      updated: review.updated,
      isDecision: review.isDecision,
      isHiddenReviewerName: review.isHiddenReviewerName,
      isHiddenFromAuthor: review.isHiddenFromAuthor,
      canBePublishedPublicly: review.canBePublishedPublicly,
      username: review.user ? review.user.username : null,
      jsonData: JSON.stringify(review.jsonData),
    }))

const firstVersionCreated = async manuscript => {
  if (manuscript.created && !manuscript.parentId) return manuscript.created
  const id = manuscript.parentId || manuscript.id

  const record = await Manuscript.query().findById(id).select('created')

  return record.created
}

const getManuscript = async id => {
  const manuscript = await Manuscript.query().findById(id)

  const submission =
    typeof manuscript.submission === 'string'
      ? JSON.parse(manuscript.submission)
      : manuscript.submission

  // Intermittent solution - optimzed way would be to use as scheduler based on embargo date
  if (
    submission?.$embargoDate &&
    submission?.$embargoDate?.length &&
    manuscript.status === 'underEmbargo'
  ) {
    const embargoTimestamp = new Date(submission?.$embargoDate).getTime()

    const currentTimestamp = Date.now()

    if (
      !Number.isNaN(embargoTimestamp) &&
      embargoTimestamp <= currentTimestamp
    ) {
      const updatedManuscript = await Manuscript.query().patchAndFetchById(id, {
        status: 'embargoReleased',
      })

      return updatedManuscript
    }
  }

  return manuscript
}

const getCss = async () => {
  const css = await generateCss()
  return css
}

const getManuscriptFiles = async (manuscriptId, manuscriptFiles) => {
  const forms = await Form.query()
  const formsElements = flatten(forms.map(f => f.structure.children))

  const files = (
    manuscriptFiles ||
    (await Manuscript.relatedQuery('files').for(manuscriptId))
  ).map(f => {
    let s3

    if (f.meta.formElementId && f.tags.includes('externalAttachmentSource')) {
      const element = formsElements.find(el => el.id === f.meta.formElementId)
      s3 = {
        accessKeyId: element.s3AccessId
          ? decrypt(element.s3AccessId)
          : element.s3AccessId,
        secretAccessKey: element.s3AccessToken
          ? decrypt(element.s3AccessToken)
          : element.s3AccessToken,
        bucket: element.s3Bucket,
        region: element.s3Region,
        url: element.s3Url,
      }
    }

    return {
      ...f,
      tags: f.tags || [],
      storedObjects: f.storedObjects || [],
      s3,
    }
  })

  return getFilesWithUrl(files)
}

const getManuscriptsData = async selectedManuscripts => {
  const foundManuscripts = await Manuscript.query()
    .findByIds(selectedManuscripts)
    .withGraphFetched('[reviews.[user], teams.[members]]')

  const exportData = []

  // eslint-disable-next-line no-restricted-syntax
  for (const manuscript of foundManuscripts) {
    // eslint-disable-next-line no-await-in-loop
    const manuscriptVersions = await manuscript.getManuscriptVersions()

    const manuscriptData = {
      versionIdentifier: manuscriptVersions.length + 1,
      ...extractCommonData(manuscript),
      reviews: extractReviewData(manuscript.reviews, false),
      decisions: extractReviewData(manuscript.reviews, true),
      manuscriptVersions: manuscriptVersions.map((version, index) => ({
        versionIdentifier: manuscriptVersions.length - index,
        ...extractCommonData(version),
        reviews: extractReviewData(version.reviews, false),
        decisions: extractReviewData(version.reviews, true),
      })),
    }

    exportData.push(manuscriptData)
  }

  return exportData
}

/** Get published artifacts from the manuscript if present, or from DB.
 * Expand the templated contents of artifacts in preparation for serving to client.
 */
const getRelatedPublishedArtifacts = async (manuscript, userId) => {
  const templatedArtifacts =
    manuscript.publishedArtifacts ||
    (await Manuscript.relatedQuery('publishedArtifacts').for(manuscript.id))

  const reviews =
    manuscript.reviews || (await getRelatedReviews(manuscript, userId))

  const threadedDiscussions =
    manuscript.threadedDiscussions ||
    (await getThreadedDiscussionsForManuscript(manuscript, getUsersById))

  const submission =
    typeof manuscript.submission === 'string'
      ? JSON.parse(manuscript.submission)
      : manuscript.submission

  if (!templatedArtifacts.length) return []

  const { submissionForm, reviewForm, decisionForm } = await getActiveForms(
    manuscript.groupId,
  )

  return applyTemplatesToArtifacts(
    templatedArtifacts,
    { ...manuscript, reviews, submission, threadedDiscussions },
    submissionForm,
    reviewForm,
    decisionForm,
  )
}

/** Get reviews from the manuscript if present, or from DB. Generate full file info for
 * all files attached to reviews, and stringify JSON data in preparation for serving to client.
 * Note: 'reviews' include the decision object.
 */
const getRelatedReviews = async (
  manuscript,
  userId,
  shouldGetPublicReviewsOnly = false,
  options = {},
) => {
  const { trx } = options
  const reviewForm = await getReviewForm(manuscript.groupId, { trx })
  const decisionForm = await getDecisionForm(manuscript.groupId, { trx })

  let reviews =
    manuscript.reviews ||
    (await Manuscript.relatedQuery('reviews', trx).for(manuscript.id)) ||
    []

  reviews = await ReviewModel.orderReviewPerUsername(reviews, { trx })

  // eslint-disable-next-line no-restricted-syntax
  for (const review of reviews) {
    // eslint-disable-next-line no-await-in-loop
    await convertFilesToFullObjects(
      review,
      review.isDecision ? decisionForm : reviewForm,
      async ids => File.query(trx).findByIds(ids),
    )
  }

  const userRoles = shouldGetPublicReviewsOnly
    ? {}
    : await getUserRolesInManuscript(userId, manuscript.id, { trx })

  const sharedReviewersIds = await getSharedReviewersIds(
    manuscript.id,
    userId,
    { trx },
  )

  // Insert isShared flag before userIds are stripped
  // TODO Should this step and the removal of confidential data be moved to the review resolver?
  reviews = reviews.map(r => ({
    ...r,
    isSharedWithCurrentUser: sharedReviewersIds.includes(r.userId),
  }))

  const manuscriptHasDecision = [
    'accepted',
    'revise',
    'rejected',
    'evaluated',
    'published',
  ].includes(manuscript.status)

  reviews = stripConfidentialDataFromReviews(
    reviews,
    reviewForm,
    decisionForm,
    sharedReviewersIds,
    userId,
    userRoles,
    manuscriptHasDecision,
  )

  return reviews.map(review => ({
    ...review,
    jsonData: JSON.stringify(review.jsonData),
  }))
}

const getSupplementaryFiles = async manuscriptId => {
  return Manuscript.relatedQuery('files')
    .for(manuscriptId)
    .where('tags', '@>', JSON.stringify(['supplementary']))
}

const importManuscripts = async (groupId, ctx) => {
  const importsSucceeded = await importManuscriptsBase(groupId, ctx)

  const semanticScholarSucceeded = await importManuscriptsFromSemanticScholar(
    groupId,
    ctx,
  )

  seekEvent('manuscript-import', { groupId })
  return importsSucceeded && semanticScholarSucceeded
}

const makeDecision = async (id, decisionKey, userId) => {
  const manuscript = await Manuscript.query()
    .findById(id)
    .withGraphFetched(
      '[submitter.[defaultIdentity], teams.members.user, reviews.user]',
    )

  manuscript.channels = await Channel.query().where({
    manuscriptId: manuscript.parentId || manuscript.id,
  })

  const activeConfig = await Config.getCached(manuscript.groupId)
  const currentUser = await User.findOneWithIdentity(userId, 'orcid')
  const { instanceName } = activeConfig.formData
  const decisionHasChanged = manuscript.decision !== decisionKey
  const isPreprint = ['preprint1', 'preprint2'].includes(instanceName)

  const decisionMap = {
    accept: 'accepted',
    revise: 'revise',
    reject: 'rejected',
  }

  const decision = decisionMap[decisionKey] || (isPreprint && 'evaluated')

  manuscript.decision = decision
  manuscript.status = decision

  if (manuscript.decision && manuscript.submitter) {
    // Automated email evaluationComplete on decision
    const recipientEmail = manuscript.submitter.email

    // Add Email Notification Record in Editorial Discussion Panel
    const channelId = manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id

    const messageContent = {
      content: `Editor Decision sent by Kotahi to {{ recipientName }}`,
      channelId,
      userId: manuscript.submitterId,
    }

    const hasVerdict = manuscript.decision !== 'evaluated'

    const eventName = `decision-form-make-decision${
      hasVerdict ? '-with-verdict' : ''
    }`

    decisionHasChanged &&
      seekEvent(eventName, {
        manuscript,
        decision: decisionKey,
        currentUser: currentUser?.username,
        context: { recipient: recipientEmail, messageContent },
        groupId: manuscript.groupId,
      })
  }

  if (decisionHasChanged && ['rejected', 'revise'].includes(decision)) {
    await sendRejectCoarNotification(manuscript, currentUser, decision)
  }

  return Manuscript.query().updateAndFetchById(id, manuscript)
}

const manuscriptChannels = manuscript => {
  return (
    manuscript.channels ||
    Manuscript.relatedQuery('channels').for(
      manuscript.parentId || manuscript.id, // chat channels belong to the first-version manuscript
    )
  )
}

const manuscriptInvitations = async manuscript => {
  return (
    manuscript.invitations ||
    Manuscript.relatedQuery('invitations').for(manuscript.id)
  )
}

const manuscripts = async () => {
  return Manuscript.query()
    .where({ parentId: null })
    .whereNot({ isHidden: true })
    .orderBy('created', 'desc')
}

const manuscriptsPublishedSinceDate = async (
  startDate,
  limit,
  offset,
  groupName,
  groupIdFromHeader,
) => {
  const groups = await Group.query().where({ isArchived: false })
  let group = null

  if (groupIdFromHeader) group = groups.find(g => g.id === groupIdFromHeader)
  else if (groupName) group = groups.find(g => g.name === groupName)
  else if (groups.length === 1) [group] = groups

  if (!group) throw new Error(`Group with name '${groupName}' not found`)

  const subQuery = Manuscript.query()
    .select('short_id')
    .max('created as latest_created')
    .where('group_id', group.id)
    .groupBy('short_id')

  const query = Manuscript.query()
    .select('m.*', raw('count(*) over () as totalCount'))
    .from(Manuscript.query().as('m'))
    .innerJoin(subQuery.as('sub'), 'm.short_id', 'sub.short_id')
    .andWhere('m.created', '=', raw('sub.latest_created'))
    .whereNotNull('m.published')
    .where('m.group_id', group.id)
    .orderBy('m.published', 'desc')

  if (startDate) query.where('m.published', '>=', new Date(startDate))
  if (limit) query.limit(limit)
  if (offset) query.offset(offset)

  return query
}

// TODO This is overcomplicated, trying to do three things at once (find manuscripts
// where user is author, reviewer or editor).
const manuscriptsUserHasCurrentRoleIn = async (
  reviewerStatus,
  wantedRoles,
  sort,
  offset,
  limit,
  filters,
  timezoneOffsetMinutes,
  groupId,
  searchInAllVersions,
  userId,
) => {
  const submissionForm = await getSubmissionForm(groupId)

  const firstVersionIds =
    await Manuscript.getFirstVersionIdsOfManuscriptsUserHasARoleIn(
      userId,
      groupId,
    )

  // Get those top-level manuscripts with all versions, all with teams and members
  const allManuscriptsWithInfo = []

  // eslint-disable-next-line no-restricted-syntax
  for (const someIds of chunk(firstVersionIds, 20)) {
    // eslint-disable-next-line no-await-in-loop
    const someManuscriptsWithInfo = await Manuscript.query()
      .withGraphFetched(
        '[teams.members, tasks, invitations, manuscriptVersions(orderByCreatedDesc).[teams.members, tasks, invitations]]',
      )
      .whereIn('id', someIds)
      .orderBy('created', 'desc')

    allManuscriptsWithInfo.push(
      ...someManuscriptsWithInfo.map(m => ({
        ...m,
        invitations: uniqBy(
          m.invitations.sort(
            (a, b) => new Date(b.responseDate) - new Date(a.responseDate),
          ),
          'toEmail',
        ),
      })),
    )
  }

  // Get the latest version of each manuscript, and check the users role in that version
  const userManuscriptsWithInfo = {}

  allManuscriptsWithInfo.forEach(m => {
    const latestVersion =
      m.manuscriptVersions && m.manuscriptVersions.length > 0
        ? m.manuscriptVersions[0]
        : m

    const versionsToSearch = searchInAllVersions
      ? [m, ...(m.manuscriptVersions ?? [])]
      : [latestVersion]

    const rolesFound = new Set()

    versionsToSearch.forEach(v =>
      v.teams
        .filter(t => wantedRoles.includes(t.role))
        .forEach(t => {
          if (
            t.members.some(
              member =>
                member.userId === userId &&
                (!reviewerStatus || member.status === reviewerStatus),
            )
          )
            rolesFound.add(t.role)
        }),
    )

    if (rolesFound.size) {
      // eslint-disable-next-line no-param-reassign
      latestVersion.hasOverdueTasksForUser = manuscriptHasOverdueTasksForUser(
        latestVersion,
        userId,
      )
      latestVersion.rolesFound = [...rolesFound]

      userManuscriptsWithInfo[latestVersion.id] = latestVersion
    }
  })

  // Apply filters to the manuscripts, limiting results to those the user has a role in
  // TODO This should move into the model, as all raw DB interactions should be controlled there
  const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
    sort,
    offset,
    limit,
    filters,
    false,
    submissionForm,
    timezoneOffsetMinutes || 0,
    Object.keys(userManuscriptsWithInfo),
    groupId,
  )

  const knex = Manuscript.knex()
  const rawQResult = await knex.raw(rawQuery, rawParams)
  let totalCount = 0

  const resultRows =
    Object.keys(userManuscriptsWithInfo).length > 0 ? rawQResult.rows : []

  if (resultRows.length) {
    totalCount = parseInt(resultRows[0].full_count, 10)
  }

  // Add in searchRank and searchSnippet
  const result = resultRows.map(row => ({
    ...userManuscriptsWithInfo[row.id],
    searchRank: row.rank,
    searchSnippet: row.snippet,
  }))

  return { totalCount, manuscripts: result }
}

const manuscriptSubmitter = async manuscript => {
  return manuscript.submitter ?? cachedGet(`submitterOfMs:${manuscript.id}`)
}

const manuscriptTasks = async manuscript => {
  return (
    manuscript.tasks ||
    Manuscript.relatedQuery('tasks').for(manuscript.id).orderBy('sequenceIndex')
  )
}

const manuscriptTeams = async manuscript => {
  return manuscript.teams || cachedGet(`teamsForObject:${manuscript.id}`)
}

const manuscriptVersions = async manuscript => {
  return cachedGet(`subVersionsOfMs:${manuscript.id}`)
}

const paginatedManuscripts = async (
  sort,
  offset,
  limit,
  filters,
  timezoneOffsetMinutes,
  archived,
  groupId,
) => {
  const submissionForm = await getSubmissionForm(groupId)

  // TODO Move this to the model, as only the model should interact with DB directly
  const [rawQuery, rawParams] = buildQueryForManuscriptSearchFilterAndOrder(
    sort,
    offset,
    limit,
    filters,
    archived,
    submissionForm,
    timezoneOffsetMinutes || 0,
    null,
    groupId,
  )

  const knex = Manuscript.knex()
  const rawQResult = await knex.raw(rawQuery, rawParams)
  let totalCount = 0
  if (rawQResult.rowCount)
    totalCount = parseInt(rawQResult.rows[0].full_count, 10)

  const ids = rawQResult.rows.map(row => row.id)
  const found = await Manuscript.query().findByIds(ids)

  const result = rawQResult.rows.map(row => ({
    ...found.find(m => m.id === row.id),
    searchRank: row.rank,
    searchSnippet: row.snippet,
  }))

  return { totalCount, manuscripts: result }
}

const printReadyPdfUrl = async manuscript => {
  // TODO reduce shared code with files resolver
  const files = (
    manuscript.files ||
    (await Manuscript.relatedQuery('files').for(manuscript.id))
  ).map(f => ({
    ...f,
    tags: f.tags || [],
    storedObjects: f.storedObjects || [],
  }))

  const printReadyPdf = files.find(f => f.tags.includes('printReadyPdf'))
  return printReadyPdf ? printReadyPdf.storedObjects[0].url : null
}

const getPublishableSubmissionFiles = async manuscript => {
  const submissionForm = await getSubmissionForm(manuscript.groupId)

  const { fieldsToPublish } =
    manuscript.formFieldsToPublish.find(ff => ff.objectId === manuscript.id) ||
    []

  const supplementaryFileField = submissionForm.structure.children.find(
    f =>
      (f.permitPublishing === 'always' ||
        (f.permitPublishing === 'true' &&
          fieldsToPublish &&
          fieldsToPublish.includes(f.name))) &&
      f.component === 'SupplementaryFiles',
  )

  if (!supplementaryFileField) return null

  const fieldTitle = supplementaryFileField ? supplementaryFileField.title : ''
  const supplementaryFiles = await getSupplementaryFiles(manuscript.id)
  const files = await getFilesWithUrl(supplementaryFiles)

  return {
    fieldTitle,
    files,
  }
}

const publishedManuscript = async id => {
  return Manuscript.query().findById(id).whereNotNull('published')
}

const publishedManuscriptDecisions = async (manuscript, userId) => {
  return useTransaction(async trx => {
    // filtering decisions in Kotahi itself so that we can change
    // the logic easily in future.
    const reviews = await getRelatedReviews(manuscript, userId, false, { trx })

    if (!Array.isArray(reviews)) {
      return []
    }

    const decisions = reviews.filter(review => review.isDecision)
    const decisionForm = await getDecisionForm(manuscript.groupId, { trx })

    const threadedDiscussions =
      manuscript.threadedDiscussions ||
      (await getThreadedDiscussionsForManuscript(manuscript, getUsersById, {
        trx,
      }))

    return getPublishableReviewFields(
      decisions,
      decisionForm,
      threadedDiscussions,
      manuscript,
    )
  })
}

const publishedManuscriptEditors = async manuscript => {
  return useTransaction(async trx => {
    const teams = await Team.query(trx)
      .where({ objectId: manuscript.id })
      .whereIn('role', ['seniorEditor', 'handlingEditor', 'editor'])

    const teamMembers = await TeamMember.query(trx).whereIn(
      'team_id',
      teams.map(t => t.id),
    )

    const editorAndRoles = await Promise.all(
      teamMembers.map(async member => {
        const user = await User.query(trx).findById(member.userId)
        const team = teams.find(t => t.id === member.teamId)
        return {
          name: user.username,
          role: team.role,
        }
      }),
    )

    return editorAndRoles
  })
}

const publishedManuscripts = async (sort, offset, limit, groupId) => {
  const query = Manuscript.query().where({ groupId }).whereNotNull('published')

  const totalCount = await query.resultSize()

  if (sort) {
    const [sortName, sortDirection] = sort.split('_')
    query.orderBy(ref(sortName), sortDirection)
  }

  if (limit) query.limit(limit)
  if (offset) query.offset(offset)
  const res = await query

  return {
    totalCount,
    manuscripts: res,
  }
}

const publishedManuscriptReviews = async (manuscript, userId) => {
  return useTransaction(async trx => {
    let reviews = await getRelatedReviews(manuscript, userId, true, { trx })

    if (!Array.isArray(reviews)) {
      return []
    }

    reviews = reviews.filter(review => !review.isDecision)
    const reviewForm = await getReviewForm(manuscript.groupId, { trx })

    const threadedDiscussions =
      manuscript.threadedDiscussions ||
      (await getThreadedDiscussionsForManuscript(manuscript, getUsersById, {
        trx,
      }))

    // eslint-disable-next-line no-restricted-syntax
    for (const review of reviews) {
      const jsonData = JSON.parse(review.jsonData)

      if (review.isCollaborative) {
        const collaborativeFormData =
          // eslint-disable-next-line no-await-in-loop
          await CollaborativeDoc.getFormData(review.id, reviewForm, { trx })

        review.jsonData = JSON.stringify({
          ...jsonData,
          ...collaborativeFormData,
        })
      }
    }

    return getPublishableReviewFields(
      reviews,
      reviewForm,
      threadedDiscussions,
      manuscript,
    )
  })
}

const publishedReviewUsers = async review => {
  return useTransaction(async trx => {
    if (review.isHiddenReviewerName) {
      return [{ id: '', username: 'Anonymous User' }]
    }

    let users = []

    if (review.isCollaborative) {
      const manuscript = await Manuscript.query(trx).findById(
        review.manuscriptId,
      )

      const existingTeam = await manuscript
        .$relatedQuery('teams', trx)
        .where('role', 'collaborativeReviewer')
        .first()

      users = await existingTeam.$relatedQuery('users', trx)
    } else {
      users = await usersLoader([review.userId], { trx })
    }

    const defaultIdentities = await defaultIdentitiesLoader(
      users.map(u => u.id),
      { trx },
    )

    return users.map((user, i) => ({
      ...user,
      defaultIdentity: defaultIdentities[i],
    }))
  })
}

// TODO: useTransaction to handle rollbacks
const publishManuscript = async (id, groupId) => {
  const manuscript = await Manuscript.query()
    .findById(id)
    .withGraphFetched('[publishedArtifacts]')

  manuscript.reviews = await manuscript.getReviews('completed')
  const decisions = await manuscript.getDecisions()

  manuscript.reviews = [...manuscript.reviews, ...decisions]

  const containsElifeStyleEvaluations = hasElifeStyleEvaluations(manuscript)

  const activeConfig = await Config.getCached(manuscript.groupId)

  // We will roll back to the following values if all publishing steps fail:
  const prevPublishedDate = manuscript.published
  const prevStatus = manuscript.status

  const newPublishedDate = new Date()
  // We update the manuscript in advance, so that external services such as Flax
  // will be able to retrieve it as a "published" manuscript. If all publishing steps
  // fail, we will revert these changes at the end.
  await Manuscript.query().patchAndFetchById(id, {
    published: newPublishedDate,
    status: 'published',
  })

  const notification = await CoarNotification.getOfferNotificationForManuscript(
    manuscript.id,
    {},
  )

  // This will also collect any properties we may want to update in the DB
  const update = {
    published: newPublishedDate,
    status: 'published',
    submission: manuscript.submission,
  }

  const steps = []

  if (activeConfig.formData.publishing.crossref?.login) {
    const stepLabel = 'Crossref'
    let succeeded = false
    let errorMessage

    if (containsElifeStyleEvaluations || manuscript.status !== 'evaluated') {
      try {
        await publishToCrossref(manuscript)
        succeeded = true
      } catch (e) {
        console.error('error publishing to crossref')
        console.error(e)
        errorMessage = e.message
      }
    }

    steps.push({
      stepLabel,
      succeeded,
      errorMessage,
    })
  }

  if (activeConfig.formData.publishing.datacite?.login) {
    const stepLabel = 'Datacite'
    let succeeded = false
    let errorMessage

    if (containsElifeStyleEvaluations || manuscript.status !== 'evaluated') {
      try {
        const doi = await publishToDatacite(manuscript)

        update.submission = {
          ...update.submission,
          $doi: doi,
        }

        update.doi = doi

        succeeded = true
      } catch (e) {
        console.error('error publishing to datacite')
        console.error(e)
        errorMessage = e.message
      }
    }

    steps.push({
      stepLabel,
      succeeded,
      errorMessage,
    })
  }

  if (activeConfig.formData.publishing.doaj?.login) {
    const stepLabel = 'DOAJ'
    let succeeded = false
    let errorMessage

    if (containsElifeStyleEvaluations || manuscript.status !== 'evaluated') {
      try {
        await publishToDOAJ(manuscript)
        succeeded = true
      } catch (e) {
        console.error('error publishing to DOAJ')
        console.error(e)
        errorMessage = e.message
      }
    }

    steps.push({
      stepLabel,
      succeeded,
      errorMessage,
    })
  }

  if (process.env.GOOGLE_SPREADSHEET_ID) {
    const stepLabel = 'Google Spreadsheet'
    let succeeded = false
    let errorMessage

    try {
      await publishToGoogleSpreadSheet(manuscript)
      update.submission = {
        ...update.submission,
        $editDate: new Date().toISOString().split('T')[0],
      }
      succeeded = true
    } catch (e) {
      console.error('error while publishing to google spreadsheet')
      console.error(e)
      errorMessage = e.message
    }

    steps.push({ succeeded, errorMessage, stepLabel })
  }

  if (activeConfig.formData.publishing.hypothesis.apiKey) {
    const stepLabel = 'Hypothesis'
    let succeeded = false
    let errorMessage

    try {
      await publishToHypothesis(manuscript)
      succeeded = true
    } catch (err) {
      console.error(err)
      let message = 'Publishing to hypothes.is failed!\n'
      if (err.response) {
        message += `${err.response.status} ${err.response.statusText}\n`
        message += `${JSON.stringify(err.response.data)}`
      } else message += err.message
      errorMessage = message
    }

    steps.push({ stepLabel, succeeded, errorMessage })
  }

  if (activeConfig.formData.publishing.webhook.url) {
    try {
      await tryPublishingWebhook(manuscript.id)
      steps.push({ stepLabel: 'Publishing webhook', succeeded: true })
    } catch (err) {
      console.error(err)
      steps.push({
        stepLabel: 'Publishing webhook',
        succeeded: false,
        errorMessage: err.message,
      })
    }
  }

  try {
    if (await tryPublishDocMaps(manuscript))
      steps.push({ stepLabel: 'DOCMAPS', succeeded: true })
  } catch (err) {
    console.error(err)
    steps.push({
      stepLabel: 'DOCMAPS',
      succeeded: false,
      errorMessage: err.message,
    })
  }

  try {
    if (await publishOnCMS(manuscript.groupId, manuscript.id))
      steps.push({ stepLabel: 'Publishing CMS', succeeded: true })
  } catch (err) {
    console.error(err)
    steps.push({
      stepLabel: 'Publishing CMS',
      succeeded: false,
      errorMessage: err.message,
    })
  }

  if (notification && manuscript.reviews.length > 1) {
    try {
      if (await sendReviewCoarNotification(notification, manuscript))
        steps.push({
          stepLabel: 'COAR Notify review complete announcement sent',
          succeeded: true,
        })
    } catch (err) {
      console.error(err)
      steps.push({
        stepLabel: 'COAR Notify review complete announcement failed',
        succeeded: false,
        errorMessage: err.message,
      })
    }
  }

  if (notification) {
    const endorsementDecision = decisions.find(
      d => d.jsonData?.$coarEndorsement,
    )

    const linkedResourceDecision = decisions.find(
      d => d.jsonData?.$coarLinkedResource,
    )

    try {
      if (
        endorsementDecision &&
        (await sendEndorsementCoarNotification(
          notification,
          manuscript,
          endorsementDecision.jsonData.$coarEndorsement,
        ))
      )
        steps.push({
          stepLabel: 'COAR Notify endorsement announcement sent',
          succeeded: true,
        })
    } catch (err) {
      console.error(err)
      steps.push({
        stepLabel: 'COAR Notify endorsement announcement failed',
        succeeded: false,
        errorMessage: err.message,
      })
    }

    try {
      if (
        linkedResourceDecision &&
        (await sendRelationshipCoarNotification(
          notification,
          manuscript,
          linkedResourceDecision.jsonData.$coarLinkedResource,
        ))
      ) {
        steps.push({
          stepLabel: 'COAR Notify relationship announcement sent',
          succeeded: true,
        })
      }
    } catch (err) {
      console.error(err)
      steps.push({
        stepLabel: 'COAR Notify relationship announcement failed',
        succeeded: false,
        errorMessage: err.message,
      })
    }
  }

  try {
    if (await sendNotificationToSciety(manuscript))
      steps.push({
        stepLabel: 'COAR Notify review announcement sent to Sciety',
        succeeded: true,
      })
  } catch (err) {
    console.error(err)
    steps.push({
      stepLabel: 'COAR Notify review announcement to Sciety failed',
      succeeded: false,
      errorMessage: err.message,
    })
  }

  let updatedManuscript

  if (steps.some(step => step.succeeded)) {
    updatedManuscript = await Manuscript.query().patchAndFetchById(id, update)

    const commentsToPublish = []

    updatedManuscript.formFieldsToPublish.forEach(formField => {
      formField.fieldsToPublish.forEach(fieldToPublish => {
        const publishFieldValues = fieldToPublish.split(':')

        if (publishFieldValues[0] === 'discussion' && publishFieldValues[1]) {
          commentsToPublish.push(publishFieldValues[1])
        }
      })
    })

    const manuscriptThreadDiscussions = await ThreadedDiscussion.query().where({
      manuscriptId: updatedManuscript.parentId || updatedManuscript.id,
    })

    await Promise.all(
      manuscriptThreadDiscussions.map(async threadDiscussion => {
        const unsetThreads = threadDiscussion.threads.map(thread => ({
          ...thread,
          comments: thread.comments.map(comment => ({
            ...comment,
            published: commentsToPublish.includes(comment.id)
              ? newPublishedDate
              : undefined,
          })),
        }))

        await ThreadedDiscussion.query().patchAndFetchById(
          threadDiscussion.id,
          { threads: JSON.stringify(unsetThreads) },
        )
      }),
    )
  } else {
    // Revert the changes to published date and status
    updatedManuscript = await Manuscript.query().patchAndFetchById(id, {
      published: prevPublishedDate,
      status: prevStatus,
    })
  }

  seekEvent('manuscript-publish', {
    manuscript: updatedManuscript,
    groupId,
  })

  return { manuscript: updatedManuscript, steps }
}

const updateAda = async (id, adaState) => {
  const manuscript = await Manuscript.query().findById(id)
  const activeConfig = await Config.getCached(manuscript.groupId)
  let updatedManuscript = manuscript

  if (activeConfig.formData.publishing.ada?.enableAdaPublish) {
    const update = {}
    const steps = []

    try {
      const data = await publishToAda(manuscript, adaState)

      steps.push({
        stepLabel: 'Publishing to ADA',
        succeeded: true,
      })

      update.submission = JSON.stringify({
        ...manuscript.submission,
        adaState: data.adaState,
        adaProcessStatus: data.adaProcessStatus,
        $doi: data.doi,
        adaId: data.adaId,
        adaJobId: data.adaJobId,
      })

      updatedManuscript = await Manuscript.query().patchAndFetchById(id, update)
    } catch (err) {
      console.error(err)

      const errorData = err.response?.data || {}

      const errorDetails = Array.isArray(errorData)
        ? errorData
        : Object.entries(errorData).map(([key, value]) => `${key}: ${value}`)

      steps.push({
        stepLabel: 'Publishing to ADA',
        succeeded: false,
        errorMessage: err.message || 'Unknown error',
        errorDetails,
      })
    }

    return { manuscript: updatedManuscript, steps }
  }

  return { manuscript: null, steps: [] }
}

const refreshAdaStatus = async id => {
  let manuscript = await Manuscript.findById(id)

  const { submission } = manuscript

  if (!submission.adaJobId) return manuscript

  const { adaJobDetails, adaJobStatus, adaProcessStatus } =
    await getAdaJobStatus(submission)

  if (
    submission.adaState === 'process' &&
    submission.adaProcessStatus === 'Pending'
  ) {
    manuscript = await Manuscript.patchAndFetchById(id, {
      submission: {
        ...submission,
        adaJobDetails,
        adaJobStatus,
        adaProcessStatus,
      },
    })
  }

  return manuscript
}

const publishOnCMS = async (groupId, manuscriptId) => {
  await rebuildCMSSite(groupId, { manuscriptId })
  return true // rebuildCMSSite will throw an exception on any failure, so no need to check its response
}

const removeReviewer = async (manuscriptId, userId) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  const reviewerTeams = await manuscript
    .$relatedQuery('teams')
    .whereIn('role', ['reviewer', 'collaborativeReviewer'])

  const [deletedTeamMember] = await TeamMember.query()
    .whereIn(
      'teamId',
      reviewerTeams.map(reviewerTeam => reviewerTeam.id),
    )
    .andWhere({
      userId,
    })
    .delete()
    .returning('*')

  await removeUserFromManuscriptChatChannel({
    manuscriptId,
    userId,
    type: 'editorial',
  })

  const reviewerTeam = await Team.query().findOne({
    id: deletedTeamMember.teamId,
  })

  return reviewerTeam.$query().withGraphFetched('members.user')
}

const removeAuthor = async (manuscriptId, userId) => {
  const manuscript = await Manuscript.findById(manuscriptId)

  const authorTeam = await Team.findTeamByRoleAndObject('author', manuscript.id)

  const [deletedTeamMember] = await TeamMember.query()
    .where({
      teamId: authorTeam.id,
      userId,
    })
    .delete()
    .returning('*')

  if (!deletedTeamMember) {
    throw new Error('Invalid author team member')
  }

  await removeUserFromManuscriptChatChannel({
    manuscriptId,
    userId,
    type: 'all',
  })

  return authorTeam.$query().withGraphFetched('members.user')
}

// TODO Rename to something like 'setReviewerResponse'
const reviewerResponse = async (action, teamId, userId) => {
  if (action !== 'accepted' && action !== 'rejected')
    throw new Error(
      `Invalid action (reviewerResponse): Must be either "accepted" or "rejected"`,
    )

  const team = await Team.query().findById(teamId).withGraphFetched('members')

  if (!team) throw new Error('No team was found')

  await Promise.all(
    team.members.map(async member => {
      if (member.userId === userId && member.status !== 'completed') {
        await TeamMember.query().patchAndFetchById(member.id, {
          status: action,
        })
      }
    }),
  )

  if (action === 'accepted') {
    await addUserToManuscriptChatChannel({
      manuscriptId: team.objectId,
      userId,
      type: 'editorial',
    })
  }

  const existingReview = await ReviewModel.query().where({
    manuscriptId: team.objectId,
    userId: team.role === 'collaborativeReviewer' ? null : userId,
    isDecision: false,
  })

  // modify it to check if there exists a review already
  if (action === 'accepted' && existingReview.length === 0) {
    const review = {
      isDecision: false,
      isHiddenReviewerName: true,
      isHiddenFromAuthor: true,
      userId: team.role === 'collaborativeReviewer' ? null : userId,
      manuscriptId: team.objectId,
      isCollaborative: team.role === 'collaborativeReviewer',
      jsonData: '{}',
    }

    await ReviewModel.query().insert(review)
  }

  const manuscript = await Manuscript.query()
    .findById(team.objectId)
    .withGraphFetched(
      '[teams.[members.[user.[defaultIdentity]]], submitter.[defaultIdentity], channels]',
    )

  const editorialChannel = manuscript?.channels.find(
    channel => channel.topic === 'Editorial discussion',
  )

  const messageContent = {
    content: `Review Rejection Email sent by Kotahi to {{ receiverName }}`,
    channelId: editorialChannel?.id,
    userId: manuscript?.submitterId,
  }

  const eventName =
    team.role === 'collaborativeReviewer'
      ? `collaborative-review-${action}`
      : `review-${action}`

  seekEvent(eventName, {
    manuscript,
    context: {
      userId,
      reviewAction: action,
      reviewerId: userId,
      teamId,
      recipient: 'handlingEditor',
      messageContent,
    },
    groupId: manuscript.groupId,
  })

  return team
}

const sendReviewCoarNotification = async (notification, manuscript) => {
  return sendAnnouncementNotification(notification, manuscript, 'review')
}

const sendEndorsementCoarNotification = async (
  notification,
  manuscript,
  endorsement,
) => {
  return sendAnnouncementNotification(notification, manuscript, 'endorsement', {
    endorsement,
  })
}

const sendRelationshipCoarNotification = async (
  notification,
  manuscript,
  linkedResource,
) => {
  return sendAnnouncementNotification(
    notification,
    manuscript,
    'relationship',
    { linkedResource },
  )
}

const sendNotificationToSciety = async manuscript => {
  const response = await sendAnnouncementNotificationToSciety(manuscript)
  return response
}

/** To identify which data we're making publishable/unpublishable, we need:
 * manuscriptId; the ID of the owning review/decision or manuscript object; and the fieldName.
 * For threaded discussion comments, the fieldName should have the commentId concatenated onto it, like this:
 * 'discussion:97b49766-8513-427e-9f4e-9c463fa9878c'
 */
const setShouldPublishField = async (
  manuscriptId,
  objectId,
  fieldName,
  shouldPublish,
) => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .withGraphFetched('[teams, channels, files, reviews.user]')

  if (shouldPublish) {
    // Add
    let formFields = manuscript.formFieldsToPublish.find(
      ff => ff.objectId === objectId,
    )

    if (!formFields) {
      formFields = { objectId, fieldsToPublish: [] }
      manuscript.formFieldsToPublish.push(formFields)
    }

    if (!formFields.fieldsToPublish.includes(fieldName))
      formFields.fieldsToPublish.push(fieldName)
  } else {
    // Remove
    manuscript.formFieldsToPublish = manuscript.formFieldsToPublish
      .map(ff => {
        if (ff.objectId !== objectId) return ff

        return {
          objectId,
          fieldsToPublish: ff.fieldsToPublish.filter(f => f !== fieldName),
        }
      })
      .filter(ff => ff.fieldsToPublish.length)
  }

  const updated = await Manuscript.query().updateAndFetchById(
    manuscriptId,
    manuscript,
  )

  return updated
}

const metaSource = async manuscript => {
  if (typeof manuscript.source !== 'string') return null

  let files =
    manuscript.manuscriptFiles ||
    (await Manuscript.relatedQuery('files').for(manuscript.manuscriptId))

  files = await getFilesWithUrl(files)
  // TODO Any reason not to use replaceImageSrcResponsive here?
  return replaceImageSrc(manuscript.source, files, 'medium')
}

const styledHtml = async manuscript => {
  // TODO reduce shared code with files resolver
  let files = (
    manuscript.files ||
    (await Manuscript.relatedQuery('files').for(manuscript.id))
  ).map(f => ({
    ...f,
    tags: f.tags || [],
    storedObjects: f.storedObjects || [],
  }))

  files = await getFilesWithUrl(files)

  const source =
    typeof manuscript.meta.source === 'string'
      ? await replaceImageSrcResponsive(manuscript.meta.source, files, 'medium')
      : null

  return applyTemplate(
    { ...manuscript, files, meta: { ...manuscript.meta, ...source } },
    true,
  )
}

const submissionWithFields = async manuscript => {
  const submissionForm = await getSubmissionForm(manuscript.groupId)
  const submission = getPublishableSubmissionFields(submissionForm, manuscript)
  return submission
}

const submitAuthorProofingFeedback = async (id, input, userId) => {
  let updated = await updateManuscript(id, input)

  const manuscript = await Manuscript.query()
    .findById(id)
    .withGraphJoined('[teams.members.user.defaultIdentity, channels]')

  if (updated.status === 'completed') {
    // after submission of feedback adding it to 'previousSubmissions' list
    let previousSubmissions = []

    if (manuscript.authorFeedback.previousSubmissions?.length > 0) {
      previousSubmissions = [...manuscript.authorFeedback.previousSubmissions]
    }

    const submitter = manuscript.authorFeedback.submitterId
      ? await User.query().findById(manuscript.authorFeedback.submitterId)
      : null

    if (manuscript.authorFeedback.submitted) {
      previousSubmissions.push({
        text: manuscript.authorFeedback.text,
        fileIds: manuscript.authorFeedback.fileIds,
        submitterId: manuscript.authorFeedback.submitterId,
        submitter: {
          id: submitter.id,
          username: submitter.username,
        },
        edited: manuscript.authorFeedback.edited,
        submitted: manuscript.authorFeedback.submitted,
      })

      delete manuscript.authorFeedback.text
      delete manuscript.authorFeedback.fileIds
      delete manuscript.authorFeedback.submitterId
      delete manuscript.authorFeedback.edited
      delete manuscript.authorFeedback.submitted
    }

    updated = await Manuscript.query().patchAndFetchById(manuscript.id, {
      authorFeedback: {
        ...manuscript.authorFeedback,
        previousSubmissions: orderBy(
          previousSubmissions,
          [obj => new Date(obj.submitted)],
          ['desc'],
        ),
      },
    })
  }

  const author = await User.query().findById(userId)

  const editorTeam = manuscript?.teams?.find(team => {
    return team.role.includes('editor')
  })

  const [editor] = editorTeam?.members ?? []
  let channelId

  if (manuscript.parentId) {
    const channel = await Manuscript.relatedQuery('channels')
      .for(manuscript.parentId)
      .findOne({ topic: 'Editorial discussion' })

    channelId = channel.id
  } else {
    channelId = manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id
  }

  const messageContent = objIf(editor, {
    content: `Author proof completed Email sent by Kotahi to ${editor.user.username}`,
    channelId,
    userId: editor.user.id,
  })

  updated.status === 'completed' &&
    seekEvent('author-proofing-submit-feedback', {
      manuscript,
      author,
      context: { recipient: 'Editor', messageContent },
      groupId: manuscript.groupId,
    })

  return updated
}

const submitManuscript = async (id, input, userId) => {
  // Automated email submissionConfirmation on submission
  const manuscript = await Manuscript.query()
    .findById(id)
    .withGraphFetched('[submitter.defaultIdentity, channels]')

  const recipient = await User.query().findById(userId)

  let channelId

  if (manuscript.parentId) {
    const channel = await Manuscript.relatedQuery('channels')
      .for(manuscript.parentId)
      .findOne({ topic: 'Editorial discussion' })

    channelId = channel.id
  } else {
    channelId = manuscript.channels.find(
      channel => channel.topic === 'Editorial discussion',
    ).id
  }

  const messageContent = {
    content: `Submission Confirmation Email sent by Kotahi to ${manuscript?.submitter?.username}`,
    channelId,
    userId: manuscript?.submitterId,
  }

  seekEvent('manuscript-submit', {
    manuscript,
    context: {
      recipient: recipient?.email,
      messageContent,
    },
    groupId: manuscript.groupId,
  })

  return updateManuscript(id, input)
}

const supplementaryFiles = async manuscript => {
  const supplementaryFilesWithTitles = await getPublishableSubmissionFiles(
    manuscript,
  )

  return JSON.stringify(supplementaryFilesWithTitles)
}

// Send the manuscriptId OR a configured ref; and send token if one is configured
const tryPublishingWebhook = async manuscriptId => {
  const manuscript = await Manuscript.query()
    .findById(manuscriptId)
    .select('groupId')

  const activeConfig = await Config.getCached(manuscript.groupId)

  const publishingWebhookUrl = activeConfig.formData.publishing.webhook.url

  if (publishingWebhookUrl) {
    const { token } = activeConfig.formData.publishing.webhook
    const reference = activeConfig.formData.publishing.webhook.ref
    const payload = { ref: reference || manuscriptId }
    if (token) payload.token = token

    await axios
      .post(publishingWebhookUrl, payload)
      // .then(res => {})
      .catch(error => {
        const message = `Failed to call publishing webhook at ${publishingWebhookUrl} for article ${manuscriptId}`
        console.error(error)
        throw new Error(message)
      })
  }
}

const updateManuscript = async (id, input) => {
  const msDelta = JSON.parse(input) // Convert the JSON input to JavaScript object
  if (msDelta.submission?.$doi?.startsWith('https://doi.org/'))
    /* eslint-disable-next-line prefer-destructuring */
    msDelta.submission.$doi =
      msDelta.submission.$doi.split('https://doi.org/')[1]

  const ms = await Manuscript.query()
    .findById(id)
    .withGraphFetched('[reviews.user, files, tasks]')

  const activeConfig = await Config.getCached(ms.groupId)

  // If this manuscript is getting its label set for the first time,
  // we will populate its task list from the template tasks
  const isSettingFirstLabels = ['prc'].includes(
    activeConfig.formData.instanceName,
  )
    ? !ms.submission.$customStatus && !!msDelta.submission?.$customStatus
    : false

  const updatedMs = deepMergeObjectsReplacingArrays(ms, msDelta)

  if (updatedMs.meta?.comments && !Array.isArray(updatedMs.meta.comments)) {
    updatedMs.meta.comments = JSON.parse(updatedMs.meta.comments)
  }

  // Create a date for new submissions
  if (
    updatedMs.status &&
    updatedMs.status !== 'new' &&
    !updatedMs.submittedDate
  ) {
    updatedMs.submittedDate = new Date()
  }

  // TODO manuscript.doi was added only to allow efficient queries in postgres.
  // We should scrap it, as it prevents single source of truth, and we can directly index the JSON field:
  // CREATE INDEX idx_manuscripts_submission_doi_gin ON manuscripts USING GIN ((submission->>'$doi'));
  // or even
  // CREATE INDEX idx_manuscripts_submission_gin ON manuscripts USING GIN (submission);
  // The latter will help with queries against other submission fields.
  if (msDelta.submission?.$doi) updatedMs.doi = msDelta.submission.$doi

  /* eslint-disable-next-line prefer-destructuring */
  updatedMs.submission.$editDate = new Date().toISOString().split('T')[0]

  // If the status is `submitted` or 'embargoReleased' and `submission.$embargoDate` is present we update the staus to `underEmbargo`
  if (
    updatedMs.submission?.$embargoDate &&
    updatedMs.submission?.$embargoDate?.length &&
    ['submitted', 'embargoReleased'].includes(updatedMs.status) &&
    updatedMs.status !== 'underEmbargo'
  ) {
    updatedMs.status = 'underEmbargo'
  }

  if (isSettingFirstLabels && !updatedMs.tasks.length)
    await populateTemplatedTasksForManuscript(id)

  if (msDelta.meta?.source) {
    updatedMs.meta.source = await sanitizeWaxImages(
      updatedMs.meta.source,
      updatedMs.id,
    )
  }

  // convert to json, otherwise you're bypassing validation
  return Manuscript.query().updateAndFetchById(id, updatedMs.$toJson())
}

const unarchiveManuscripts = async ids => {
  // finding the ids of the first versions of all manuscripts:
  const selectedManuscripts = await Manuscript.query()
    .select('parentId', 'id')
    .whereIn('id', ids)

  const firstVersionIds = selectedManuscripts.map(m => m.parentId || m.id)

  // unarchiving manuscripts with either firstVersionID or parentID
  const unarchivedManuscripts = await Manuscript.query()
    .returning('id')
    .update({ isHidden: false })
    .whereIn('id', firstVersionIds)
    .orWhereIn('parentId', firstVersionIds)

  return unarchivedManuscripts.map(m => m.id)
}

const unreviewedPreprints = async (token, groupName) => {
  const groups = await Group.query().where({ isArchived: false })
  let group = null
  if (groupName) group = groups.find(g => g.name === groupName)
  else if (groups.length === 1) [group] = groups
  if (!group) throw new Error(`Group with name '${groupName}' not found`)

  const activeConfig = await Config.getCached(group.id)

  if (activeConfig.formData.integrations.kotahiApis.tokens) {
    validateApiToken(
      token,
      activeConfig.formData.integrations.kotahiApis.tokens,
    )
  } else {
    throw new Error('Kotahi api tokens are not configured!')
  }

  const foundManuscripts = await Manuscript.query()
    .where({ status: 'new', groupId: group.id })
    .whereRaw(`submission->>'$customStatus' = 'readyToEvaluate'`)

  return foundManuscripts.map(m => ({
    id: m.id,
    shortId: m.shortId,
    title: m.submission.$title,
    abstract: m.submission.$abstract,
    authors: m.submission.$authors || [],
    doi: m.submission.$doi,
    uri: m.submission.$sourceUri,
  }))
}

/** Return true if the DOI exists (is found in Crossref) */
const validateDOI = async doiOrUrl => {
  const doi = doiOrUrl.startsWith('https://doi.org/')
    ? encodeURI(doiOrUrl.split('.org/')[1])
    : doiOrUrl

  return { isDOIValid: await doiExists(doi) }
}

/** Return true if a DOI formed from this suffix has not already been assigned (i.e. not found in Crossref) */
// To be called in submit manuscript as
// first validation step for custom suffix
const validateSuffix = async (suffix, groupId) => {
  const activeConfig = await Config.getCached(groupId)

  const doi = getDoi(suffix, activeConfig)
  return { isDOIValid: await doiIsAvailable(doi) }
}

/** Return all version IDs for which the current user is assigned as a reviewer */
const versionsOfManuscriptCurrentUserIsReviewerOf = async (
  manuscriptId,
  userId,
) => {
  const otherVersions = await (
    await Manuscript.query().findById(manuscriptId)
  ).getManuscriptVersions()

  const versionIds = [manuscriptId, ...otherVersions.map(v => v.id)]

  const assignments = await User.relatedQuery('teams')
    .for(userId)
    .select('objectId')
    .whereIn('role', ['reviewer', 'collaborativeReviewer'])
    .whereIn('objectId', versionIds)

  return [...new Set(assignments.map(a => a.objectId))]
}

module.exports = {
  addReviewer,
  archiveManuscript,
  archiveManuscripts,
  assignAuthorForProofingManuscript,
  authorFeedback,
  createManuscript,
  createNewVersion,
  deleteManuscript,
  deleteManuscripts,
  doisToRegister,
  firstVersionCreated,
  getCss,
  getManuscript,
  getManuscriptFiles,
  getManuscriptsData,
  getRelatedPublishedArtifacts,
  getRelatedReviews,
  importManuscripts,
  makeDecision,
  manuscriptChannels,
  manuscriptInvitations,
  manuscripts,
  manuscriptsPublishedSinceDate,
  manuscriptSubmitter,
  manuscriptsUserHasCurrentRoleIn,
  manuscriptTasks,
  manuscriptTeams,
  manuscriptVersions,
  metaSource,
  paginatedManuscripts,
  printReadyPdfUrl,
  publishedManuscript,
  publishedManuscriptDecisions,
  publishedManuscriptEditors,
  publishedManuscriptReviews,
  publishedManuscripts,
  publishedReviewUsers,
  publishManuscript,
  refreshAdaStatus,
  removeAuthor,
  removeReviewer,
  reviewerResponse,
  setShouldPublishField,
  styledHtml,
  submissionWithFields,
  submitAuthorProofingFeedback,
  submitManuscript,
  supplementaryFiles,
  unarchiveManuscripts,
  unreviewedPreprints,
  updateAda,
  updateManuscript,
  validateDOI,
  validateSuffix,
  versionsOfManuscriptCurrentUserIsReviewerOf,
}

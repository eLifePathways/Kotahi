const { uuid, useTransaction } = require('@coko/server')

const { Config, Manuscript, ThreadedDiscussion } = require('../models')

const {
  getIdOfLatestVersionOfManuscript,
} = require('./manuscript/manuscriptCommsUtils')

const { getUsersById, getUserRolesInManuscript } = require('./user.controllers')
const seekEvent = require('../services/notification.service')

/** Get the threaded discussion with "author" user object added to each commentVersion and pendingVersion */
const addUserObjectsToDiscussion = async (
  discussion,
  getUsersByIdFunc,
  options = {},
) => {
  const userIds = getAllUserIdsInDiscussion(discussion)
  const users = await getUsersByIdFunc(userIds, options)
  const usersMap = {}

  users.forEach(u => {
    usersMap[u.id] = u
  })

  return {
    ...discussion,
    threads: discussion.threads.map(thread => ({
      ...thread,
      comments: thread.comments.map(c => ({
        ...c,
        commentVersions: c.commentVersions.map(cv => ({
          ...cv,
          author: usersMap[cv.userId],
        })),
        pendingVersions: c.pendingVersions.map(pv => ({
          ...pv,
          author: usersMap[pv.userId],
        })),
      })),
    })),
  }
}

const completeCommentInLockedDiscussion = async (
  threadedDiscussionId,
  threadId,
  commentId,
  userId,
  permissions,
  options = {},
) => {
  const { trx } = options
  const now = new Date().toISOString()
  const lockedDiscussion = await lockDiscussion(threadedDiscussionId, { trx })

  const thread = lockedDiscussion.threads.find(t => t.id === threadId)
  if (!thread) throw new Error(`thread with ID ${threadId} not found`)
  const comment = thread.comments.find(c => c.id === commentId)
  if (!comment) throw new Error(`comment with ID ${commentId} not found`)

  if (!userMayWriteComment(comment, userId, permissions))
    throw new Error('Not Authorised!')

  const converted = convertUsersPendingVersionsToCommentVersions(
    userId,
    comment,
    now,
  )

  if (converted) {
    thread.updated = now
    lockedDiscussion.updated = now
    await saveThreads(lockedDiscussion, { trx })
  }

  return { discussion: lockedDiscussion, hasUpdated: converted }
}

const completeComment = async (
  threadedDiscussionId,
  threadId,
  commentId,
  groupId,
  userId,
) => {
  const { discussion, hasUpdated } = await useTransaction(async trx => {
    const permissions = await getUserCommentPermissions(
      await getManuscriptIdOfDiscussion(threadedDiscussionId, { trx }),
      userId,
      { trx },
    )

    return completeCommentInLockedDiscussion(
      threadedDiscussionId,
      threadId,
      commentId,
      userId,
      permissions,
      { trx },
    )
  })

  // Only once committed, so the notification can't go out for a change that
  // was rolled back, and anything it reads sees the new comment.
  if (hasUpdated) {
    const manuscript = await Manuscript.findById(discussion.manuscriptId)

    seekEvent('decision-form-complete-comment', {
      threadedDiscussionId,
      threadId,
      commentId,
      context: {
        threadedDiscussionId,
        threadId,
        commentId,
        userId,
      },
      groupId,
      manuscript,
    })
  }

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

const completeComments = async (threadedDiscussionId, userId) => {
  const discussion = await useTransaction(async trx => {
    const now = new Date().toISOString()

    const permissions = await getUserCommentPermissions(
      await getManuscriptIdOfDiscussion(threadedDiscussionId, { trx }),
      userId,
      { trx },
    )

    const lockedDiscussion = await lockDiscussion(threadedDiscussionId, { trx })
    let hasUpdated = false

    for (const thread of lockedDiscussion.threads) {
      for (const comment of thread.comments) {
        // Skip rather than throw: this runs on decision form submission, which shouldn't fail over a stray pending comment
        if (
          userMayWriteComment(comment, userId, permissions) &&
          convertUsersPendingVersionsToCommentVersions(userId, comment, now)
        ) {
          hasUpdated = true
          thread.updated = now
          lockedDiscussion.updated = now
        }
      }
    }

    if (hasUpdated) await saveThreads(lockedDiscussion, { trx })

    return lockedDiscussion
  })

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

/** Complete all pending comments for this user. That is, turn them into commentVersions.
 * Note: this modifies the discussion IN PLACE. */
const convertUsersPendingVersionsToCommentVersions = (userId, comment, now) => {
  let hasUpdated = false

  // Should be only one pendingVersion for a user, but to be safe we assume there could be multiple

  for (const pendingVersion of comment.pendingVersions.filter(
    pv =>
      pv.userId === userId && !isNewEmptyComment(pv, comment.commentVersions),
  )) {
    if (!comment.commentVersions) comment.commentVersions = []

    comment.commentVersions.push({
      id: uuid(),
      created: now,
      updated: now,
      userId,
      comment: pendingVersion.comment,
    })
    hasUpdated = true

    comment.updated = now
  }

  comment.pendingVersions = comment.pendingVersions.filter(
    pv => pv.userId !== userId,
  )

  return hasUpdated
}

const deletePendingComment = async (
  threadedDiscussionId,
  threadId,
  commentId,
  userId,
) => {
  const discussion = await useTransaction(async trx => {
    const lockedDiscussion = await lockDiscussion(threadedDiscussionId, { trx })

    const thread = lockedDiscussion.threads.find(t => t.id === threadId)
    if (!thread) throw new Error(`thread with ID ${threadId} not found`)
    const comment = thread.comments.find(c => c.id === commentId)
    if (!comment) throw new Error(`comment with ID ${commentId} not found`)

    comment.pendingVersions = comment.pendingVersions.filter(
      pv => pv.userId !== userId,
    )

    await saveThreads(lockedDiscussion, { trx })

    return lockedDiscussion
  })

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

/** Every comment mutation rewrites the whole threads array, so concurrent ones
 * (eg. an editor's debounced save landing alongside "Save edit") would
 * otherwise overwrite each other. Locks the row for the rest of the transaction.
 * Callers return the discussion from the transaction and only then run
 * stripHiddenAndAddUserInfo, so the lock isn't held through its lookups. */
const lockDiscussion = async (threadedDiscussionId, options = {}) => {
  const { trx } = options
  const discussion = await ThreadedDiscussion.query(trx)
    .forUpdate()
    .findById(threadedDiscussionId)

  if (!discussion)
    throw new Error(
      `threadedDiscussion with ID ${threadedDiscussionId} not found`,
    )

  return discussion
}

const saveThreads = (discussion, options = {}) =>
  ThreadedDiscussion.query(options.trx)
    .update({
      updated: discussion.updated,
      threads: JSON.stringify(discussion.threads),
    })
    .where({ id: discussion.id })

const getManuscriptIdOfDiscussion = async (
  threadedDiscussionId,
  options = {},
) => {
  const discussion = await ThreadedDiscussion.query(options.trx)
    .select('manuscriptId')
    .findById(threadedDiscussionId)

  if (!discussion)
    throw new Error(
      `threadedDiscussion with ID ${threadedDiscussionId} not found`,
    )

  return discussion.manuscriptId
}

const filterDistinct = (id, index, arr) => arr.indexOf(id) === index

const getActiveConfigOfThreadedDiscussion = async (
  discussion,
  options = {},
) => {
  const { groupId } = await Manuscript.findById(
    discussion.manuscriptId,
    options,
  )
  const config = await Config.getCached(groupId, options)

  return config
}

/** Get all authors of commentVersions and pendingVersions throughout the discussion */
const getAllUserIdsInDiscussion = discussion =>
  discussion.threads
    .map(t =>
      t.comments.map(c =>
        c.commentVersions
          .map(v => v.userId)
          .concat(c.pendingVersions.map(v => v.userId)),
      ),
    )
    .flat(2)
    .filter(filterDistinct)

const getOriginalVersionManuscriptId = async (manuscriptId, options = {}) => {
  const ms = await Manuscript.query(options.trx)
    .select('parentId')
    .findById(manuscriptId)

  const parentId = ms ? ms.parentId : null
  return parentId || manuscriptId
}

const getThreadedDiscussionsForManuscript = async (
  manuscript,
  getUsersByIdFunc,
) =>
  Promise.all(
    (
      await ThreadedDiscussion.query().where({
        manuscriptId: manuscript.parentId || manuscript.id,
      })
    ).map(discussion =>
      addUserObjectsToDiscussion(discussion, getUsersByIdFunc),
    ),
  )

const isNewEmptyComment = (pendingVersion, commentVersions) =>
  (!pendingVersion || pendingVersion.comment === '<p class="paragraph"></p>') &&
  (!commentVersions || !commentVersions.length)

/** Returns a threadedDiscussion that strips out all pendingVersions not for this userId,
 * then all comments that don't have any remaining pendingVersion or commentVersions,
 * then all threads that don't have any remaining comments.
 * Also adds flags indicating what the user is permitted to do.
 */
const stripHiddenAndAddUserInfo = async (
  discussion,
  userId,
  getUsersByIdFunc,
  options = {},
) => {
  const discussionWithUsers = await addUserObjectsToDiscussion(
    discussion,
    getUsersByIdFunc,
    options,
  )

  return {
    ...stripPendingVersionsExceptByUser(discussionWithUsers, userId),
    ...(await getUserCommentPermissions(
      discussion.manuscriptId,
      userId,
      options,
    )),
  }
}

/** What the user may do in threaded discussions on this manuscript.
 * Global admins are deliberately not granted anything here. */
const getUserCommentPermissions = async (
  manuscriptId,
  userId,
  options = {},
) => {
  const { formData } = await getActiveConfigOfThreadedDiscussion(
    {
      manuscriptId,
    },
    options,
  )

  const { editorsEditDiscussionPostsEnabled = false } = formData.controlPanel

  const userRoles = await getUserRolesInManuscript(
    userId,
    await getIdOfLatestVersionOfManuscript(manuscriptId, options),
    options,
  )

  return {
    userCanAddComment:
      userRoles.author ||
      userRoles.anyEditor ||
      userRoles.groupManager ||
      userRoles.groupAdmin, // Current use case prohibits reviewers from commenting
    userCanEditOwnComment:
      !!editorsEditDiscussionPostsEnabled &&
      (userRoles.anyEditor || userRoles.groupManager || userRoles.groupAdmin),
    userCanEditAnyComment:
      !!editorsEditDiscussionPostsEnabled &&
      (userRoles.anyEditor || userRoles.groupManager || userRoles.groupAdmin),
  }
}

/** Whether the user may write to this comment: adding it if it has no submitted
 * versions yet, otherwise editing it (own comment = they wrote the first version). */
const userMayWriteComment = (comment, userId, permissions) => {
  if (!comment?.commentVersions?.length) return !!permissions.userCanAddComment

  return (
    !!permissions.userCanEditAnyComment ||
    (!!permissions.userCanEditOwnComment &&
      comment.commentVersions[0].userId === userId)
  )
}

/** Return a copy of the discussion with all pendingVersions of comments by other users stripped out.
 * There should be no more than 1 pendingVersion for the given user in each comment,
 * so instead of supplying a pendingVersions array we provide a single pendingVersion value which can be undefined.
 */
const stripPendingVersionsExceptByUser = (discussion, userId) => ({
  ...discussion,
  threads: discussion.threads
    .map(thread => ({
      ...thread,
      comments: thread.comments
        .map(c => ({
          ...c,
          pendingVersion: c.pendingVersions.filter(
            pv => pv.userId === userId,
          )[0], // Should be no more than 1 pendingVersion for any user
          pendingVersions: undefined, // Hide pendingVersions for other users
        }))
        .filter(c => c.commentVersions.length || c.pendingVersion),
    }))
    .filter(t => t.comments.length),
})

const threadedDiscussions = async (manuscriptVersionId, userId) => {
  return useTransaction(async trx => {
    const manuscriptId = await getOriginalVersionManuscriptId(
      manuscriptVersionId,
      { trx },
    )

    const result = await ThreadedDiscussion.query(trx)
      .where({ manuscriptId })
      .orderBy('created', 'desc')

    return Promise.all(
      result.map(async discussion => {
        return stripHiddenAndAddUserInfo(discussion, userId, getUsersById, {
          trx,
        })
      }),
    )
  })
}

const updatePendingComment = async (
  msVersionId,
  threadedDiscussionId,
  threadId,
  commentId,
  comment,
  msCurrentVersionId,
  userId,
) => {
  const discussion = await useTransaction(async trx => {
    const now = new Date().toISOString()

    const manuscriptId = await getOriginalVersionManuscriptId(msVersionId, {
      trx,
    })

    const permissions = await getUserCommentPermissions(manuscriptId, userId, {
      trx,
    })

    // Not lockDiscussion: the discussion may not exist yet
    let lockedDiscussion = await ThreadedDiscussion.query(trx)
      .forUpdate()
      .findById(threadedDiscussionId)

    const existingComment = lockedDiscussion?.threads
      .find(t => t.id === threadId)
      ?.comments.find(c => c.id === commentId)

    if (!userMayWriteComment(existingComment, userId, permissions))
      throw new Error('Not Authorised!')

    if (!lockedDiscussion)
      lockedDiscussion = {
        id: threadedDiscussionId,
        manuscriptId,
        threads: [],
        created: now,
      }

    let thread = lockedDiscussion.threads.find(t => t.id === threadId)

    if (!thread) {
      thread = { id: threadId, comments: [], created: now }
      lockedDiscussion.threads.push(thread)
    }

    let commnt = thread.comments.find(c => c.id === commentId)

    if (!commnt) {
      commnt = {
        id: commentId,
        manuscriptVersionId: msCurrentVersionId,
        commentVersions: [],
        pendingVersions: [],
        created: now,
      }
      thread.comments.push(commnt)
    }

    let pendingVersion = commnt.pendingVersions.find(pv => pv.userId === userId)

    if (!pendingVersion) {
      pendingVersion = {
        userId,
        created: now,
      }
      commnt.pendingVersions.push(pendingVersion)
    }

    pendingVersion.updated = now
    pendingVersion.comment = comment

    await ThreadedDiscussion.query(trx).upsertGraphAndFetch(
      {
        ...lockedDiscussion,
        threads: JSON.stringify(lockedDiscussion.threads),
      },
      { insertMissing: true },
    )

    return lockedDiscussion
  })

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

module.exports = {
  completeComment,
  completeComments,
  deletePendingComment,
  getThreadedDiscussionsForManuscript,
  threadedDiscussions,
  updatePendingComment,
}

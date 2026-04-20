const { uuid } = require('@coko/server')

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
  const { trx } = options
  const userIds = getAllUserIdsInDiscussion(discussion)
  const users = await getUsersByIdFunc(userIds, { trx })
  const usersMap = {}
  users.forEach(u => (usersMap[u.id] = u))

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

const completeComment = async (
  threadedDiscussionId,
  threadId,
  commentId,
  groupId,
  userId,
) => {
  const now = new Date().toISOString()

  const discussion = await ThreadedDiscussion.query().findById(
    threadedDiscussionId,
  )

  if (!discussion)
    throw new Error(
      `threadedDiscussion with ID ${threadedDiscussionId} not found`,
    )

  const thread = discussion.threads.find(t => t.id === threadId)
  if (!thread) throw new Error(`thread with ID ${threadId} not found`)
  const comment = thread.comments.find(c => c.id === commentId)
  if (!comment) throw new Error(`comment with ID ${commentId} not found`)

  if (convertUsersPendingVersionsToCommentVersions(userId, comment, now)) {
    thread.updated = now
    discussion.updated = now

    await ThreadedDiscussion.query()
      .update({
        updated: discussion.updated,
        threads: JSON.stringify(discussion.threads),
      })
      .where({ id: threadedDiscussionId })

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
  const now = new Date().toISOString()
  let hasUpdated = false

  const discussion = await ThreadedDiscussion.query().findById(
    threadedDiscussionId,
  )

  if (!discussion)
    throw new Error(
      `threadedDiscussion with ID ${threadedDiscussionId} not found`,
    )

  /* eslint-disable-next-line no-restricted-syntax */
  for (const thread of discussion.threads) {
    /* eslint-disable-next-line no-restricted-syntax */
    for (const comment of thread.comments) {
      if (convertUsersPendingVersionsToCommentVersions(userId, comment, now)) {
        hasUpdated = true
        thread.updated = now
        discussion.updated = now
      }
    }
  }

  if (hasUpdated)
    await ThreadedDiscussion.query()
      .update({
        updated: discussion.updated,
        threads: JSON.stringify(discussion.threads),
      })
      .where({ id: threadedDiscussionId })

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

/** Complete all pending comments for this user. That is, turn them into commentVersions.
 * Note: this modifies the discussion IN PLACE. */
const convertUsersPendingVersionsToCommentVersions = (userId, comment, now) => {
  let hasUpdated = false

  // Should be only one pendingVersion for a user, but to be safe we assume there could be multiple
  /* eslint-disable-next-line no-restricted-syntax */
  for (const pendingVersion of comment.pendingVersions.filter(
    pv =>
      pv.userId === userId && !isNewEmptyComment(pv, comment.commentVersions),
  )) {
    /* eslint-disable-next-line no-param-reassign */
    if (!comment.commentVersions) comment.commentVersions = []

    comment.commentVersions.push({
      id: uuid(),
      created: now,
      updated: now,
      userId,
      comment: pendingVersion.comment,
    })
    hasUpdated = true
    /* eslint-disable-next-line no-param-reassign */
    comment.updated = now
  }

  /* eslint-disable-next-line no-param-reassign */
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
  const discussion = await ThreadedDiscussion.query().findById(
    threadedDiscussionId,
  )

  if (!discussion)
    throw new Error(
      `threadedDiscussion with ID ${threadedDiscussionId} not found`,
    )

  const thread = discussion.threads.find(t => t.id === threadId)
  if (!thread) throw new Error(`thread with ID ${threadId} not found`)
  const comment = thread.comments.find(c => c.id === commentId)
  if (!comment) throw new Error(`comment with ID ${commentId} not found`)

  comment.pendingVersions = comment.pendingVersions.filter(
    pv => pv.userId !== userId,
  )

  await ThreadedDiscussion.query()
    .update({
      updated: discussion.updated,
      threads: JSON.stringify(discussion.threads),
    })
    .where({ id: threadedDiscussionId })

  return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
}

const filterDistinct = (id, index, arr) => arr.indexOf(id) === index

const getActiveConfigOfThreadedDiscussion = async discussion => {
  const { groupId } = await Manuscript.query().findById(discussion.manuscriptId)
  const config = await Config.getCached(groupId)

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

const getOriginalVersionManuscriptId = async manuscriptId => {
  const ms = await Manuscript.query().select('parentId').findById(manuscriptId)

  const parentId = ms ? ms.parentId : null
  return parentId || manuscriptId
}

const getThreadedDiscussionsForManuscript = async (
  manuscript,
  getUsersByIdFunc,
  options = {},
) => {
  const { trx } = options
  return Promise.all(
    (
      await ThreadedDiscussion.query(trx).where({
        manuscriptId: manuscript.parentId || manuscript.id,
      })
    ).map(discussion =>
      addUserObjectsToDiscussion(discussion, getUsersByIdFunc, { trx }),
    ),
  )
}

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
) => {
  const discussionWithUsers = await addUserObjectsToDiscussion(
    discussion,
    getUsersByIdFunc,
  )

  const { formData } = await getActiveConfigOfThreadedDiscussion(discussion)

  const { editorsEditDiscussionPostsEnabled = false } = formData.controlPanel

  const userRoles = await getUserRolesInManuscript(
    userId,
    await getIdOfLatestVersionOfManuscript(discussion.manuscriptId),
  )

  return {
    ...stripPendingVersionsExceptByUser(discussionWithUsers, userId),
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
  const manuscriptId = await getOriginalVersionManuscriptId(manuscriptVersionId)

  const result = await ThreadedDiscussion.query()
    .where({ manuscriptId })
    .orderBy('created', 'desc')

  return Promise.all(
    result.map(async discussion => {
      return stripHiddenAndAddUserInfo(discussion, userId, getUsersById)
    }),
  )
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
  // TODO ensure that the current user is permitted to comment
  const now = new Date().toISOString()
  const manuscriptId = await getOriginalVersionManuscriptId(msVersionId)

  let discussion = await ThreadedDiscussion.query().findById(
    threadedDiscussionId,
  )
  if (!discussion)
    discussion = {
      id: threadedDiscussionId,
      manuscriptId,
      threads: [],
      created: now,
    }

  let thread = discussion.threads.find(t => t.id === threadId)

  if (!thread) {
    thread = { id: threadId, comments: [], created: now }
    discussion.threads.push(thread)
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

  await ThreadedDiscussion.query().upsertGraphAndFetch(
    { ...discussion, threads: JSON.stringify(discussion.threads) },
    { insertMissing: true },
  )

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

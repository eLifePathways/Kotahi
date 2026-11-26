const { uuidValidate, verifyJWT } = require('@coko/server')

const Manuscript = require('../../models/manuscript/manuscript.model')
const Review = require('../../models/review/review.model')
const TeamMember = require('../../models/teamMember/teamMember.model')
const User = require('../../models/user/user.model')

const verifyToken = token =>
  new Promise(resolve => {
    if (!token) {
      resolve(null)
      return
    }

    verifyJWT(token, (_, userId) => resolve(userId || null))
  })

/** Reads the document name and token from a connection URL such as `/<reviewId>?token=...` */
const parseConnectionUrl = url => {
  const { pathname, searchParams } = new URL(url, 'http://localhost')
  const docName = decodeURIComponent(pathname.split('/').pop() || '')
  return { docName, token: searchParams.get('token') }
}

const canAccessReview = async (userId, manuscript) => {
  const [isAdmin, isGroupAdmin, isGm, isEditor, reviewerMember] =
    await Promise.all([
      User.hasGlobalRole(userId, 'admin'),
      User.hasRoleOnObject(userId, 'groupAdmin', manuscript.groupId),
      User.hasRoleOnObject(userId, 'groupManager', manuscript.groupId),
      User.isEditorOfManuscript(userId, manuscript.id),
      TeamMember.findReviewerMemberOnManuscript(userId, manuscript.id),
    ])

  return isAdmin || isGroupAdmin || isGm || isEditor || !!reviewerMember
}

/**
 * Checks that a Yjs connection comes from a logged-in user who may work on the
 * collaborative review it names. Returns the document's name and metadata,
 * taken from the database rather than the URL, or null if access is refused.
 */
const authoriseConnection = async url => {
  const { docName, token } = parseConnectionUrl(url)
  if (!uuidValidate(docName)) return null

  const userId = await verifyToken(token)
  if (!userId) return null

  const review = await Review.findById(docName, { throwIfNotFound: false })
  if (!review?.isCollaborative) return null

  const manuscript = await Manuscript.findById(review.manuscriptId, {
    throwIfNotFound: false,
  })

  if (!manuscript) return null
  if (!(await canAccessReview(userId, manuscript))) return null

  return {
    docName,
    userId,
    extraData: {
      objectId: review.id,
      objectType: 'Review',
      category: 'review',
      purpose: 'review',
      groupId: manuscript.groupId,
    },
  }
}

module.exports = { authoriseConnection }

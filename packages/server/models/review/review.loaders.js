const { useTransaction } = require('@coko/server')

const Review = require('./review.model')
// const Manuscript = require('../manuscript/manuscript.model')
const User = require('../user/user.model')
const Team = require('../team/team.model')
const { defaultIdentitiesLoader } = require('../user/user.loaders')

const usersLoader = async (reviewIds, options = {}) => {
  const run = async trx => {
    // Step 1: Fetch all reviews
    const reviews = await Review.query(trx).findByIds(reviewIds)

    const reviewToUsers = new Map(
      reviews.map(r => [
        r.id,
        {
          userIds: [],
          isCollaborative: r.isCollaborative,
          isHidden: r.isHiddenReviewerName,
          manuscriptId: r.manuscriptId,
        },
      ]),
    )

    // Separate collaborative and solo
    const collaborative = reviews.filter(r => r.isCollaborative)
    const solo = reviews.filter(r => !r.isCollaborative)

    // Step 2: Collaborative in one query
    if (collaborative.length) {
      const manuscriptIds = collaborative.map(r => r.manuscriptId)

      const teams = await Team.query(trx)
        .where('role', 'collaborativeReviewer')
        .whereIn('manuscriptId', manuscriptIds)
        .withGraphFetched('users')

      const teamsByManuscript = new Map(teams.map(t => [t.manuscriptId, t]))

      collaborative
        .filter(review => teamsByManuscript.has(review.manuscriptId))
        .forEach(review => {
          const team = teamsByManuscript.get(review.manuscriptId)
          reviewToUsers.get(review.id).userIds = team.users.map(u => u.id)
        })
    }

    // Step 3: Solo reviews
    solo
      .filter(review => review.userId)
      .forEach(review => {
        reviewToUsers.get(review.id).userIds = [review.userId]
      })

    // Step 4: Anonymous
    reviews
      .filter(review => review.isHiddenReviewerName)
      .forEach(review => {
        reviewToUsers.get(review.id).users = [
          { id: '', username: 'Anonymous User' },
        ]
      })

    // Step 5: Fetch all users and identities
    const allUserIds = [
      ...new Set(
        Array.from(reviewToUsers.values())
          .flatMap(r => r.userIds)
          .filter(Boolean),
      ),
    ]

    const users = allUserIds.length
      ? await User.query(trx).findByIds(allUserIds)
      : []

    const defaultIdentities = allUserIds.length
      ? await defaultIdentitiesLoader(allUserIds, { trx })
      : []

    const byUserId = new Map(
      users.map((u, i) => [
        u.id,
        { ...u, defaultIdentity: defaultIdentities[i] },
      ]),
    )

    // Step 6: Final mapping
    return reviewIds.map(id => {
      const entry = reviewToUsers.get(id)
      if (!entry) return []
      if (entry.users) return entry.users
      return entry.userIds.map(uid => byUserId.get(uid)).filter(Boolean)
    })
  }

  // Use provided transaction or none at all (skip useTransaction)
  if (options.trx) {
    return run(options.trx)
  }

  // No ctx.trx? Run without useTransaction to avoid pool pressure
  return useTransaction(run)
}

module.exports = { usersLoader }

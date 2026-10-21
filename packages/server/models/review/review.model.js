const { BaseModel } = require('@coko/server')

class Review extends BaseModel {
  static get tableName() {
    return 'reviews'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Review'
  }

  static get relatedFindQueryMutates() {
    return false
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        userId: {
          anyOf: [
            {
              type: 'string',
              format: 'uuid',
            },
            {
              type: 'null',
            },
          ],
        },
        user: { type: ['object', 'null'] },
        isDecision: { type: 'boolean' },
        isHiddenFromAuthor: { type: 'boolean' },
        isHiddenReviewerName: { type: 'boolean' },
        isCollaborative: { type: 'boolean' },
        isImported: { type: 'boolean' },
        isLock: { type: 'boolean' },
        canBePublishedPublicly: { type: 'boolean' },
        jsonData: {},
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')
    const Manuscript = require('../manuscript/manuscript.model')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'reviews.manuscriptId',
          to: 'manuscripts.id',
        },
      },
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'reviews.userId',
          to: 'users.id',
        },
      },
    }
  }

  /** Users of each review, in the same order as the reviews: the manuscript's
   * collaborative reviewer team for a collaborative review, otherwise the
   * review's own user. Missing users or teams give an empty array. */
  static async getUsersOfReviews(reviews, options = {}) {
    const { trx } = options
    const Team = require('../team/team.model')
    const User = require('../user/user.model')

    const manuscriptIds = [
      ...new Set(
        reviews.filter(r => r.isCollaborative).map(r => r.manuscriptId),
      ),
    ]

    const userIds = [
      ...new Set(
        reviews.filter(r => !r.isCollaborative && r.userId).map(r => r.userId),
      ),
    ]

    const teams = manuscriptIds.length
      ? await Team.findCollaborativeReviewerTeams(manuscriptIds, { trx })
      : []

    const users = userIds.length
      ? await User.findByIds(userIds, { trx, throwIfNotFound: false })
      : []

    const teamUsersByManuscriptId = new Map()

    teams.forEach(team => {
      if (!teamUsersByManuscriptId.has(team.objectId))
        teamUsersByManuscriptId.set(team.objectId, team.users)
    })

    const usersById = new Map(users.map(u => [u.id, u]))

    return reviews.map(review => {
      if (review.isCollaborative)
        return teamUsersByManuscriptId.get(review.manuscriptId) ?? []

      const user = usersById.get(review.userId)
      return user ? [user] : []
    })
  }

  static async orderReviewPerUsername(reviews, options = {}) {
    const usersOfReviews = await Review.getUsersOfReviews(reviews, options)

    // imported manuscripts may have invalid reviewers
    const reviewWithUsers = reviews.map((review, i) => ({
      ...review,
      username: usersOfReviews[i][0]?.username || '',
    }))

    return reviewWithUsers.sort((reviewOne, reviewTwo) => {
      // Get the username of reviewer and convert to uppercase
      const usernameOne = reviewOne.username.toUpperCase()
      const usernameTwo = reviewTwo.username.toUpperCase()

      // Sort by username
      if (usernameOne < usernameTwo) return -1
      if (usernameOne > usernameTwo) return 1

      // If the username don't match then sort by reviewId
      if (reviewOne.id < reviewTwo.id) return -1
      if (reviewOne.id > reviewTwo.id) return 1

      return 0
    })
  }
}

Review.type = 'Review'
module.exports = Review

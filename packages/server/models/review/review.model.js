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
    /* eslint-disable global-require */
    const User = require('../user/user.model')
    const Manuscript = require('../manuscript/manuscript.model')
    /* eslint-enable global-require */

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

  static async orderReviewPerUsername(reviews, options = {}) {
    const { trx } = options
    // eslint-disable-next-line global-require
    const User = require('../user/user.model')
    // eslint-disable-next-line global-require
    const Manuscript = require('../manuscript/manuscript.model')

    const reviewWithUsers = await Promise.all(
      reviews.map(async review => {
        let users = null

        if (review.isCollaborative) {
          const manuscript = await Manuscript.query(trx).findById(
            review.manuscriptId,
          )

          const existingTeam = await manuscript
            .$relatedQuery('teams', trx)
            .where('role', 'collaborativeReviewer')
            .first()

          // eslint-disable-next-line no-param-reassign
          users = await existingTeam.$relatedQuery('users', trx)
        } else {
          users = await User.query(trx).where({ id: review.userId })
        }

        return { ...review, username: users[0]?.username || '' } // imported manuscripts may have invalid reviewers
      }),
    )

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

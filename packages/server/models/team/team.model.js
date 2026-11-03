const { Team: TeamBase } = require('@coko/server')

// REFACTOR: MODELS
const { evictFromCache } = require('../../services/queryCache.service')

class Team extends TeamBase {
  static get modifiers() {
    return {
      onlyAuthors(builder) {
        builder.where('role', 'author')
      },
      onlyEditors(builder) {
        builder.where('role', 'editor')
      },
    }
  }

  static get relationMappings() {
    const User = require('../user/user.model')

    return {
      members: {
        relation: TeamBase.HasManyRelation,
        modelClass: require.resolve('../teamMember/teamMember.model'),
        join: {
          from: 'teams.id',
          to: 'team_members.teamId',
        },
      },
      users: {
        relation: TeamBase.ManyToManyRelation,
        modelClass: User,
        join: {
          from: 'teams.id',
          through: {
            modelClass: require.resolve('../teamMember/teamMember.model'),
            from: 'team_members.teamId',
            to: 'team_members.userId',
          },
          to: 'users.id',
        },
      },
      manuscript: {
        relation: TeamBase.BelongsToOneRelation,
        modelClass: require.resolve('../manuscript/manuscript.model'),
        join: {
          from: 'teams.objectId',
          to: 'manuscripts.id',
        },
      },
    }
  }

  static async findActiveTeamsOfUserOnObject(userId, objectId, options = {}) {
    return (
      Team.query(options.trx)
        .select('role')
        .withGraphJoined('members')
        .where({ objectId, userId })
        // If status is null, whereNotIn('status', ['invited', 'rejected']) returns false.
        // I'm not sure why this is, but it means we need a separate check for status===null.
        .where(
          builder =>
            builder
              .whereNull('status')
              .orWhereNotIn('status', ['invited', 'rejected']), // Reviewers with status 'invited' or 'rejected' are not actually reviewers
        )
    )
  }

  static async findSharedReviewerMembers(
    manuscriptId,
    currentUserId,
    options = {},
  ) {
    return Team.relatedQuery('members', options.trx)
      .for(
        Team.query(options.trx).where({
          objectId: manuscriptId,
          role: 'reviewer',
        }),
      )
      .select('userId')
      .where({ isShared: true })
      .where(builder =>
        builder
          .where({ status: 'completed' })
          .orWhere({ userId: currentUserId }),
      )
  }

  static async findNonInvitedMembersWithUser(objectId, roles, options = {}) {
    const { trx } = options

    return Team.relatedQuery('members', trx)
      .where(builder => {
        builder
          .whereNull('status')
          .orWhereNotIn('status', ['invited', 'rejected'])
      })
      .for(
        Team.query(trx)
          .where({ objectType: 'manuscript', objectId })
          .whereIn('role', roles),
      )
      .withGraphFetched('user')
  }

  /** Sets the status of the user's membership in the object's team with the given role,
   * if that membership is still in 'invited' status */
  static async patchInvitedMemberStatus(
    objectId,
    role,
    userId,
    status,
    options = {},
  ) {
    const { trx } = options

    return Team.relatedQuery('members', trx)
      .for(Team.query(trx).findOne({ objectId, role }))
      .patch({ status })
      .where({ userId, status: 'invited' })
  }

  /** Teams of an object with the given roles, with their users */
  static async findWithUsers(objectId, roles, options = {}) {
    const { trx } = options

    return Team.query(trx)
      .where({ objectId })
      .whereIn('role', roles)
      .withGraphFetched('users')
  }

  /** Collaborative reviewer teams of the given manuscripts, with their users */
  static async findCollaborativeReviewerTeams(manuscriptIds, options = {}) {
    const { trx } = options

    return Team.query(trx)
      .where({ role: 'collaborativeReviewer' })
      .whereIn('objectId', manuscriptIds)
      .withGraphFetched('users')
      .orderBy('created')
  }

  // TODO add $beforeDelete once https://github.com/Coko-Foundation/cokoserver/issues/43 is resolved
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    evictFromCache(`teamsForObject:${this.objectId}`)
  }
}

Team.type = 'team'

module.exports = Team

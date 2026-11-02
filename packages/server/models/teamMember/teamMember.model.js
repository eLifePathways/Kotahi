const { TeamMember: TeamMemberBase } = require('@coko/server')

// REFACTOR: MODELS
const { evictFromCacheByPrefix } = require('../../services/queryCache.service')

const REVIEWER_ROLES = ['reviewer', 'collaborativeReviewer']

class TeamMember extends TeamMemberBase {
  static get modifiers() {
    return {
      orderByCreatedDesc(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  // TODO add $beforeDelete once https://github.com/Coko-Foundation/cokoserver/issues/43 is resolved
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    evictFromCacheByPrefix('userIs')
    evictFromCacheByPrefix('membersOfTeam')
  }

  static get schema() {
    return {
      properties: {
        isShared: { type: ['boolean', 'null'] },
      },
    }
  }

  /**
   * Returns a list of objects showing what role this reviewer has on each
   * manuscript.
   * Can filter to return results for specific statuses only.
   */
  static async getReviewerStatusesForUser(userId, groupId, options = {}) {
    const { trx, statusFilter = [] } = options

    const rows = await TeamMember.query(trx)
      .select('teamMembers.status', 'teams.objectId as manuscriptId')
      .join('teams', 'teams.id', 'teamMembers.teamId')
      .join('manuscripts', 'manuscripts.id', 'teams.objectId')
      .where('teamMembers.userId', userId)
      .where('teams.objectType', 'manuscript')
      .where('manuscripts.groupId', groupId)
      .whereIn('teams.role', REVIEWER_ROLES)
      .modify(builder => {
        if (statusFilter.length > 0) {
          builder.whereIn('teamMembers.status', statusFilter)
        }
      })

    return rows.map(row => ({
      manuscriptId: row.manuscriptId,
      status: row.status,
    }))
  }
}

module.exports = TeamMember

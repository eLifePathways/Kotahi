const { TeamMember: TeamMemberBase } = require('@coko/server')

// REFACTOR: MODELS
const { evictFromCacheByPrefix } = require('../../services/queryCache.service')

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
}

module.exports = TeamMember

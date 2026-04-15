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
    /* eslint-disable-next-line global-require */
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

  // TODO add $beforeDelete once https://github.com/Coko-Foundation/cokoserver/issues/43 is resolved
  async $beforeInsert(queryContext) {
    await super.$beforeInsert(queryContext)
    evictFromCache(`teamsForObject:${this.objectId}`)
  }
}

Team.type = 'team'

module.exports = Team

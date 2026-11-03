const bcrypt = require('bcrypt')
const pick = require('lodash/pick')
const { env } = require('@coko/server')
const { raw } = require('objection')

const { BaseModel, modelJsonSchemaTypes } = require('@coko/server')

const { idNullable } = modelJsonSchemaTypes

const BCRYPT_COST = env('NODE_ENV') === 'test' ? 1 : 12

const EDITOR_ROLES = ['seniorEditor', 'handlingEditor', 'editor']

class User extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'user'
  }

  $formatJson(json) {
    const cleanedJson = super.$formatJson(json)
    delete cleanedJson.passwordHash
    return cleanedJson
  }

  static get tableName() {
    return 'users'
  }

  static get relationMappings() {
    const Identity = require('../identity/identity.model')
    const Review = require('../review/review.model')

    return {
      identities: {
        relation: BaseModel.HasManyRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
      },
      defaultIdentity: {
        relation: BaseModel.HasOneRelation,
        modelClass: Identity,
        join: {
          from: 'users.id',
          to: 'identities.userId',
        },
        filter: builder => {
          builder.where('isDefault', true)
        },
      },
      teams: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: require.resolve('../team/team.model'),
        join: {
          from: 'users.id',
          through: {
            modelClass: require.resolve('../teamMember/teamMember.model'),
            from: 'team_members.userId',
            to: 'team_members.teamId',
            extra: ['status'],
          },
          to: 'teams.id',
        },
      },
      reviews: {
        relation: BaseModel.HasManyRelation,
        modelClass: Review,
        join: {
          from: 'users.id',
          to: 'reviews.userId',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        admin: { type: ['boolean', 'null'] },
        email: {
          anyOf: [
            {
              type: 'string',
              format: 'email',
            },
            { type: 'null' },
          ],
        },
        username: { type: 'string' },
        passwordHash: { type: ['string', 'null'] },
        online: { type: ['boolean', 'null'] },
        passwordResetToken: { type: ['string', 'null'] },
        passwordResetTimestamp: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            { type: 'object' },
            { type: 'null' },
          ],
        },
        profilePicture: idNullable,
        lastOnline: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            { type: 'object' },
            { type: 'null' },
          ],
        },
        preferredLanguage: { type: ['string', 'null'] },
      },
    }
  }

  // This gives a view of the teams and team member structure to reflect
  // the current roles the user is performing. E.g. if they are a member
  // of a reviewer team and have the status of 'accepted', they will
  // have a 'accepted:reviewer' role present in the returned object
  async currentRoles(object) {
    let teams

    if (object && object.objectId && object.objectType) {
      teams = await this.$relatedQuery('teams').where(object)
    } else {
      teams = await this.$relatedQuery('teams')
    }

    const roles = {}

    teams.forEach(t => {
      const role = `${t.status ? `${t.status}:` : ''}${t.role}`

      // If there's an existing role for this object, add to the list
      if (t.objectId && Array.isArray(roles[t.objectId])) {
        roles[t.objectId].push(role)
      } else if (t.objectId) {
        roles[t.objectId] = [role]
      }
    })
    return Object.keys(roles).map(id => ({ id, roles: roles[id] }))
  }

  // NOT USED
  // async save() {
  //   if (this.password) {
  //     this.passwordHash = await User.hashPassword(this.password)
  //     delete this.password
  //   }

  //   return super.save()
  // }

  async validPassword(password) {
    return password && this.passwordHash
      ? bcrypt.compare(password, this.passwordHash)
      : false
  }

  static hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_COST)
  }

  // NOT USED
  // static findByEmail(email) {
  //   return this.findByField('email', email).then(users => users[0])
  // }

  // NOT USED
  // static findByUsername(username) {
  //   return this.findByField('username', username).then(users => users[0])
  // }

  static async findOneWithIdentity(userId, identityType, options = {}) {
    const { trx } = options
    const user = await this.query(trx)
      .findById(userId)
      .withGraphFetched('identities')
      .modifyGraph('identities', builder => builder.where('type', identityType))

    return user
  }

  static async findByIdentity(type, identifier, options = {}) {
    return User.query(options.trx)
      .joinRelated('identities')
      .where('identities.identifier', identifier)
      .where('identities.type', type)
      .first()
  }

  static async countAll(options = {}) {
    return User.query(options.trx).resultSize()
  }

  /** Number of users in any team on the given object */
  static async countInTeamsOfObject(objectId, options = {}) {
    return User.query(options.trx)
      .joinRelated('teams')
      .where({ 'teams.objectId': objectId })
      .resultSize()
  }

  static async findByUsernamePrefix(prefix, options = {}) {
    const { trx } = options
    // Escape LIKE wildcards so the prefix is matched literally
    const escapedPrefix = prefix.replace(/[\\%_]/g, '\\$&')

    return this.query(trx).where('username', 'like', `${escapedPrefix}%`)
  }

  static async hasGlobalRole(userId, role, options = {}) {
    const TeamMember = require('../teamMember/teamMember.model')

    const member = await TeamMember.query(options.trx)
      .join('teams', 'team_members.teamId', 'teams.id')
      .findOne({ 'teams.global': true, 'teams.role': role, userId })

    return !!member
  }

  static async hasRoleOnObject(userId, role, objectId, options = {}) {
    const TeamMember = require('../teamMember/teamMember.model')

    const member = await TeamMember.query(options.trx)
      .join('teams', 'team_members.teamId', 'teams.id')
      .findOne({ 'teams.role': role, 'teams.objectId': objectId, userId })

    return !!member
  }

  static async isEditorOfManuscript(userId, manuscriptId, options = {}) {
    const TeamMember = require('../teamMember/teamMember.model')

    const member = await TeamMember.query(options.trx)
      .join('teams', 'team_members.teamId', 'teams.id')
      .whereIn('teams.role', EDITOR_ROLES)
      .where({ userId, 'teams.objectId': manuscriptId })
      .first()

    return !!member
  }

  static async isEditorOfAnyManuscript(userId, options = {}) {
    const TeamMember = require('../teamMember/teamMember.model')

    const member = await TeamMember.query(options.trx)
      .join('teams', 'team_members.teamId', 'teams.id')
      .whereIn('teams.role', EDITOR_ROLES)
      .where({ userId })
      .first()

    return !!member
  }

  static async getGroupAndGlobalRoles(userId, groupId, options = {}) {
    if (!groupId) throw new Error('groupId is required')

    const Team = require('../team/team.model')

    const teams = await Team.query(options.trx)
      .select('role', 'objectId')
      .withGraphJoined('members')
      .where({ userId })
      .where(function subcondition() {
        this.whereRaw('global').orWhere({ objectId: groupId })
      })

    const groupRoles = []
    const globalRoles = []

    teams.forEach(team => {
      // TODO remove the first condition once groups have IDs
      if (team.role === 'admin') globalRoles.push(team.role)
      else if (team.objectId === groupId) groupRoles.push(team.role)
      else globalRoles.push(team.role)
    })

    return { groupRoles, globalRoles }
  }

  static async findGroupManagersAndAdmins(groupId, options = {}) {
    const Team = require('../team/team.model')
    const { trx } = options

    return Team.relatedQuery('users', trx)
      .for(
        Team.query(trx)
          .where({
            objectId: groupId,
            objectType: 'group',
          })
          .whereIn('role', ['groupManager', 'groupAdmin']),
      )
      .modify('orderByUsername')
  }

  static async findUsersInGroup(groupId, options = {}) {
    return User.query(options.trx)
      .joinRelated('teams')
      .where({
        role: 'user',
        objectId: groupId,
      })
      .modify('orderByUsername')
      .withGraphFetched('defaultIdentity')
  }

  static async findPaginated(params, options = {}) {
    const { allUsers, groupId, sort, offset, limit } = params

    const query = allUsers
      ? User.query(options.trx)
      : User.query(options.trx).joinRelated('teams').where({
          role: 'user',
          objectId: groupId,
        })

    const totalCount = await query.resultSize()

    if (sort) {
      const [fieldName, direction] = sort.split('_')

      if (fieldName === 'lastOnline') {
        query.orderByRaw(
          `(last_online IS NULL) ${direction === 'DESC' ? 'ASC' : 'DESC'}`,
        )
      }

      query.orderBy(fieldName, direction)
    }

    if (limit) {
      query.limit(limit)
    }

    if (offset) {
      query.offset(offset)
    }

    const users = await query

    return { totalCount, users }
  }

  /** IDs of the given objects on which the user is in a team with one of the given roles.
   * An object ID appears once per matching team. */
  static async getTeams(userId, options = {}) {
    return User.relatedQuery('teams', options.trx).for(userId)
  }

  static async getObjectIdsWithRoles(userId, roles, objectIds, options = {}) {
    const teams = await User.relatedQuery('teams', options.trx)
      .for(userId)
      .select('objectId')
      .whereIn('role', roles)
      .whereIn('objectId', objectIds)

    return teams.map(t => t.objectId)
  }

  static get modifiers() {
    return {
      orderByUsername(builder) {
        builder.orderBy(raw('LOWER(username)'), 'ASC')
      },
    }
  }

  // For API display/JSON purposes only
  static ownersWithUsername(object) {
    return Promise.all(
      object.owners.map(async ownerId => {
        const owner = await this.findById(ownerId)
        return pick(owner, ['id', 'username'])
      }),
    )
  }
}

User.type = 'user'

module.exports = User

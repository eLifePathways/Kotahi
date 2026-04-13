const { BaseModel } = require('@coko/server')

class Token extends BaseModel {
  static get tableName() {
    return 'tokens'
  }

  static get relationMappings() {
    // eslint-disable-next-line global-require
    const Group = require('../group/group.model')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'tokens.group_id',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: 'string' },
        value: { type: 'string' },
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }

  static async deleteTokenById(tokenId, options = {}) {
    const { trx } = options

    return this.query(trx).deleteById(tokenId)
  }

  static async deleteByNameAndGroupId(name, groupId, options = {}) {
    const { trx } = options

    return this.query(trx).delete().where({ name, groupId })
  }

  static async generateToken(name, value, groupId, options = {}) {
    const { trx } = options

    await this.deleteByNameAndGroupId(name, groupId, { trx })

    return this.query(trx).insert({ name, value, groupId })
  }

  static async getTokenByNameAndGroupId(name, groupId, options = {}) {
    const { value } = (await this.findOne({ name, groupId }, options)) ?? {}

    return value
  }
}

module.exports = Token

const { BaseModel } = require('@coko/server')

// const INVALIDATE_CACHE_PERIOD_MS = 10000 // Refetch from DB if ten seconds have elapsed

class Config extends BaseModel {
  static get tableName() {
    return 'configs'
  }

  constructor(properties) {
    super(properties)
    this.type = 'config'
  }

  static cachedConfigsByGroupId = {}
  // static timeToInvalidateCache = 0

  /** Gets the active config for this groupId, retrieving from in-memory cache
   *  if available.
   */
  static async getCached(groupId, options = {}) {
    // The following code can be uncommented to periodically invalidate the cache.
    // This would be necessary if multiple servers were accessing the same DB.

    // const now = Date.now()
    // if (now > this.timeToInvalidateCache) {
    //   this.cachedConfigsByGroupId = {}
    //   this.timeToInvalidateCache = now + INVALIDATE_CACHE_PERIOD_MS
    // }

    const { trx } = options

    let config = this.cachedConfigsByGroupId[groupId]

    if (!config) {
      config = await this.query(trx).findOne({ groupId, active: true })
      // Check again in case another task has set it in the meantime
      if (!this.cachedConfigsByGroupId[groupId])
        this.cachedConfigsByGroupId[groupId] = config
    }

    return config
  }

  static async beforeUpdate() {
    this.cachedConfigsByGroupId = {}
  }

  static async beforeDelete() {
    this.cachedConfigsByGroupId = {}
  }

  static get relationMappings() {
    const Group = require('../group/group.model')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'configs.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        active: { type: ['boolean', 'null'] },
        formData: {},
        groupId: {
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
      },
    }
  }
}

Config.type = 'Config'

module.exports = Config

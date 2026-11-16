const { BaseModel } = require('@coko/server')

class CMSPage extends BaseModel {
  static get tableName() {
    return 'cms_pages'
  }

  static get relationMappings() {
    const User = require('../user/user.model')

    return {
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'cms_pages.creatorId',
          to: 'users.id',
        },
      },
    }
  }

  static get schema() {
    const flaxConfig = {
      type: 'object',
      additionalProperties: false,
      properties: {
        shownInMenu: { type: ['boolean', 'null'] },
        sequenceIndex: { type: ['integer', 'null'] },
      },
    }

    return {
      properties: {
        url: { type: 'string' },
        title: { type: 'string' },
        status: { type: 'string' },
        content: { type: 'string' },
        meta: {},
        creatorId: {
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
        published: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        edited: {
          anyOf: [
            {
              type: 'string',
              format: 'date-time',
            },
            {
              type: 'object',
            },
            {
              type: 'null',
            },
          ],
        },
        flaxHeaderConfig: flaxConfig,
        flaxFooterConfig: flaxConfig,
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }

  /** The group's pages ordered by title, with only id, title, url and the given flax config column */
  static async findInGroupWithFlaxConfig(groupId, configKey, options = {}) {
    return CMSPage.query(options.trx)
      .where('groupId', groupId)
      .select(['id', 'title', 'url', configKey])
      .orderBy('title')
  }
}

module.exports = CMSPage

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
}

module.exports = CMSPage

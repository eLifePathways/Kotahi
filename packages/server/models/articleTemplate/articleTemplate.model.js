const { BaseModel } = require('@coko/server')

class ArticleTemplate extends BaseModel {
  static get tableName() {
    return 'article_templates'
  }

  constructor(properties) {
    super(properties)
    this.type = 'ArticleTemplate'
  }

  static get relationMappings() {
    const { File } = require('@coko/server')

    const Group = require('../group/group.model')

    return {
      files: {
        relation: BaseModel.HasManyRelation,
        modelClass: File,
        join: {
          from: 'article_templates.id',
          to: 'files.objectId',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'article_templates.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: ['string', 'null'] },
        article: { type: ['string', 'null'] },
        css: { type: ['string', 'null'] },
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
        isCms: { type: 'boolean' },
      },
    }
  }
}

ArticleTemplate.type = 'ArticleTemplate'

module.exports = ArticleTemplate

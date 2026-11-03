const { BaseModel } = require('@coko/server')

class ArticleImportHistory extends BaseModel {
  static get tableName() {
    return 'article_import_history'
  }

  static async patchBySourceAndGroup(sourceId, groupId, data, options = {}) {
    return ArticleImportHistory.query(options.trx)
      .patch(data)
      .where({ sourceId, groupId })
  }

  static async patchByDateAndGroup(date, groupId, data, options = {}) {
    return ArticleImportHistory.query(options.trx)
      .patch(data)
      .where({ date, groupId })
  }

  static get schema() {
    return {
      properties: {
        date: {
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
        sourceId: {
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

ArticleImportHistory.type = 'ArticleImportHistory'
module.exports = ArticleImportHistory

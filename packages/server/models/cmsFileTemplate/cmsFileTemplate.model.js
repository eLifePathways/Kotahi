const { BaseModel, useTransaction } = require('@coko/server')

class CMSFileTemplate extends BaseModel {
  static get tableName() {
    return 'cms_file_templates'
  }

  static get relationMappings() {
    const { File } = require('@coko/server')

    return {
      file: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'cms_file_templates.fileId',
          to: 'files.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        name: { type: ['string', 'null'] },
        fileId: {
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
        parentId: {
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
        groupId: { type: 'string', format: 'uuid' },
        rootFolder: { type: 'boolean' },
      },
    }
  }

  /** Makes the given folder the group's only root folder */
  static async setRootFolder(id, groupId, options = {}) {
    return useTransaction(
      async trx => {
        await CMSFileTemplate.query(trx)
          .patch({ rootFolder: false })
          .where({ groupId })

        return CMSFileTemplate.query(trx)
          .patch({ rootFolder: true })
          .findOne({ id, groupId })
          .returning('*')
      },
      { trx: options.trx },
    )
  }
}

module.exports = CMSFileTemplate

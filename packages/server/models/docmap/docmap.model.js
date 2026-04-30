const { BaseModel } = require('@coko/server')

class Docmap extends BaseModel {
  static get tableName() {
    return 'docmaps'
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        groupId: { type: 'string', format: 'uuid' },
        externalId: { type: 'string' },
        content: { type: 'string' },
      },
    }
  }

  static get relationMappings() {
    const Group = require('../group/group.model')
    const Manuscript = require('../manuscript/manuscript.model')

    return {
      manuscript: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Manuscript,
        join: {
          from: 'docmaps.manuscriptId',
          to: 'manuscripts.id',
        },
      },
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'docmaps.groupId',
          to: 'groups.id',
        },
      },
    }
  }
}

Docmap.type = 'Docmap'
module.exports = Docmap

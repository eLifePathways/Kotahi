const { BaseModel } = require('@coko/server')

class CMSLayout extends BaseModel {
  static get tableName() {
    return 'cms_layouts'
  }

  static get relationMappings() {
    const { File } = require('@coko/server')

    return {
      logo: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: File,
        join: {
          from: 'cms_layouts.logoId',
          to: 'files.id',
        },
      },
    }
  }

  static get schema() {
    const arrayOfStoredPartners = {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          url: { type: 'string' },
          sequenceIndex: { type: ['integer', 'null'] },
        },
      },
    }

    return {
      properties: {
        active: { type: ['boolean'] },
        isPrivate: { type: ['boolean'] },
        hexCode: { type: ['string', 'null'] },
        primaryColor: { type: 'string' },
        secondaryColor: { type: 'string' },
        logoId: {
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
        partners: arrayOfStoredPartners,
        footerText: { type: ['string', 'null'] },
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
        groupId: { type: 'string', format: 'uuid' },
      },
    }
  }
}

module.exports = CMSLayout

const { BaseModel } = require('@coko/server')

class Form extends BaseModel {
  static get tableName() {
    return 'forms'
  }

  constructor(properties) {
    super(properties)
    this.type = 'Form'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get relationMappings() {
    const Group = require('../group/group.model')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'forms.groupId',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      properties: {
        purpose: { type: 'string' },
        category: { type: 'string' },
        structure: {
          type: 'object',
          properties: {
            name: { type: ['string', 'null'] },
            description: { type: ['string', 'null'] },
            haspopup: { type: 'string' },
            popuptitle: { type: ['string', 'null'] },
            popupdescription: { type: ['string', 'null'] },
            children: {
              items: {
                type: 'object',
                properties: {
                  options: {
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        value: { type: 'string' },
                        labelColor: { type: 'string' },
                        id: { type: 'string', format: 'uuid' },
                      },
                    },
                    type: ['array', 'null'],
                  },
                  title: { type: ['string', 'null'] },
                  shortDescription: { type: ['string', 'null'] },
                  id: { type: 'string', format: 'uuid' },
                  component: { type: ['string', 'null'] },
                  name: { type: ['string', 'null'] },
                  description: { type: ['string', 'null'] },
                  uploadAttachmentSource: { type: 'string' },
                  s3Url: { type: 'string' },
                  s3AccessId: { type: 'string' },
                  s3AccessToken: { type: 'string' },
                  s3Bucket: { type: 'string' },
                  s3Region: { type: 'string' },
                  doiValidation: { type: ['string', 'null'] },
                  placeholder: { type: ['string', 'null'] },
                  isReadOnly: { type: ['string', 'null'] },
                  hideFromReviewers: { type: ['string', 'null'] },
                  inline: { type: ['string', 'null'] },
                  sectioncss: { type: ['string', 'null'] },
                  parse: { type: ['string', 'null'] },
                  format: { type: ['string', 'null'] },
                  validate: {
                    items: {
                      type: 'object',
                      properties: {
                        label: { type: 'string' },
                        value: { type: 'string' },
                        id: { type: 'string', format: 'uuid' },
                      },
                    },
                    type: ['array', 'null'],
                  },
                  validateValue: {
                    type: ['object', 'null'],
                    properties: {
                      minChars: { type: ['string', 'null'] },
                      maxChars: { type: ['string', 'null'] },
                      minSize: { type: ['string', 'null'] },
                    },
                  },
                },
              },
              type: 'array',
            },
          },
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

Form.type = 'Form'
module.exports = Form

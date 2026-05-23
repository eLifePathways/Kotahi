const { BaseModel } = require('@coko/server')
const Y = require('yjs')

class CollaborativeDoc extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'CollaborativeDoc'
  }

  static get tableName() {
    return 'collaborative_docs'
  }

  static get relationMappings() {
    /* eslint-disable-next-line global-require */
    const Group = require('../group/group.model')

    return {
      group: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Group,
        join: {
          from: 'collaborative_docs.group_id',
          to: 'groups.id',
        },
      },
    }
  }

  static get schema() {
    return {
      type: 'object',
      properties: {
        objectId: { type: 'string', format: 'uuid' },
        objectType: { type: ['string'] },
        groupId: { type: 'string', format: 'uuid' },
        yDocState: {
          format: 'binary',
        },
      },
    }
  }

  static async getFormData(objectId, form, options = {}) {
    const { trx } = options

    const collaborativeDoc = await CollaborativeDoc.query(trx).findOne({
      objectId,
    })

    const {
      structure: { children: fields },
    } = form

    const formFields = await Promise.all(
      fields.map(field => {
        const obj = {}

        if (field.component === 'TextField') {
          const value = collaborativeDoc.readDocState(field.name, 'Text')
          obj[field.name] = value
          return obj
        }

        if (
          field.component === 'AbstractEditor' ||
          field.component === 'Abstract' ||
          field.component === 'FullWaxField'
        ) {
          const value = collaborativeDoc.readDocState(field.name, 'XMLFragment')

          obj[field.name] = value
          return obj
        }

        return {}
      }),
    )

    return formFields.reduce((result, obj) => {
      Object.entries(obj).forEach(([key, value]) => {
        // eslint-disable-next-line no-param-reassign
        result[key] = value
      })
      return result
    }, {})
  }

  readDocState(objName, objType) {
    const doc = new Y.Doc()

    Y.applyUpdate(doc, this.yDocState)

    switch (objType) {
      case 'Array':
        return doc.getArray(objName).toString()
      case 'Map':
        return doc.getMap(objName).toString()
      case 'Text':
        return doc.getText(objName).toString()
      case 'XMLFragment':
        return doc.getXmlFragment(objName).toString()
      case 'XmlElement':
        return doc.getXmlElement(objName).toString()
      default:
        return {}
    }
  }
}

module.exports = CollaborativeDoc

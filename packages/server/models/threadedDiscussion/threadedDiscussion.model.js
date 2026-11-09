const { BaseModel } = require('@coko/server')

class ThreadedDiscussion extends BaseModel {
  static get tableName() {
    return 'threaded_discussions'
  }

  static get modifiers() {
    return {
      orderByCreated(builder) {
        builder.orderBy('created', 'desc')
      },
    }
  }

  static get schema() {
    return {
      properties: {
        manuscriptId: { type: 'string', format: 'uuid' },
        threads: {},
      },
    }
  }

  /** Locks the row for the rest of the transaction */
  static async findByIdForUpdate(id, options = {}) {
    return ThreadedDiscussion.query(options.trx).forUpdate().findById(id)
  }

  static async getManuscriptId(id, options = {}) {
    const discussion = await ThreadedDiscussion.query(options.trx)
      .select('manuscriptId')
      .findById(id)

    if (!discussion)
      throw new Error(`threadedDiscussion with ID ${id} not found`)

    return discussion.manuscriptId
  }

  static async upsertAndFetch(data, options = {}) {
    return ThreadedDiscussion.query(options.trx).upsertGraphAndFetch(data, {
      insertMissing: true,
    })
  }
}

ThreadedDiscussion.type = 'ThreadedDiscussion'
module.exports = ThreadedDiscussion

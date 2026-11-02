const { subscriptionManager } = require('@coko/server')

const {
  createFile,
  deleteFile,
  deleteFiles,
  getEntityFiles,
  getSpecificFiles,
  getFilesByTagOrId,
  updateFile,
  updateTagsFile,
  uploadFiles,
} = require('../../../controllers/file.controllers')

const FILES_UPLOADED = 'FILES_UPLOADED'
const FILE_UPDATED = 'FILE_UPDATED'
const FILES_DELETED = 'FILES_DELETED'

const resolvers = {
  Query: {
    async getEntityFiles(_, { input }) {
      return getEntityFiles(input)
    },
    async getSpecificFiles(_, { ids }) {
      return getSpecificFiles(ids)
    },
    async getFilesByTagOrId(_, { input }) {
      return getFilesByTagOrId(input)
    },
  },
  Mutation: {
    async createFile(_, { file, meta }) {
      return createFile(file, meta)
    },
    async deleteFile(_, { id }) {
      return deleteFile(id)
    },
    async deleteFiles(_, { ids }) {
      const deletedIds = await deleteFiles(ids)

      subscriptionManager.publish(FILES_DELETED, {
        filesDeleted: true,
      })

      return deletedIds
    },
    async uploadFiles(_, { files, fileType, entityId }) {
      const uploaded = await uploadFiles(files, fileType, entityId)

      subscriptionManager.publish(FILES_UPLOADED, {
        filesUploaded: true,
      })

      return uploaded
    },
    async updateFile(_, { input }) {
      const updated = await updateFile(input)

      subscriptionManager.publish(FILE_UPDATED, {
        fileUpdated: updated,
      })

      return updated
    },
    async updateTagsFile(_, { input }) {
      return updateTagsFile(input)
    },
  },
  Subscription: {
    filesUploaded: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILES_UPLOADED)
      },
    },
    filesDeleted: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILES_DELETED)
      },
    },
    fileUpdated: {
      subscribe: async () => {
        return subscriptionManager.asyncIterator(FILE_UPDATED)
      },
    },
  },
}

module.exports = resolvers

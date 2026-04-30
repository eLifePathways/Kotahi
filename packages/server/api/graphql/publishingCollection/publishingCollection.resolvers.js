const {
  collectionFormDataFile,
  collectionFormDataImage,
  collectionManuscripts,
  createCollection,
  deleteCollection,
  getPublishingCollections,
  updateCollection,
} = require('../../../controllers/publishingCollection.controllers')

module.exports = {
  Query: {
    publishingCollection: async (_, { groupId }) => {
      return getPublishingCollections(groupId)
    },
  },

  Mutation: {
    createCollection: async (_, { input }, ctx) => {
      const groupId = ctx.req.headers['group-id']
      return createCollection(input, groupId)
    },

    deleteCollection: async (_, { id }) => {
      return deleteCollection(id)
    },

    updateCollection: async (_, { id, input }) => {
      return updateCollection(id, input)
    },
  },

  PublishCollection: {
    manuscripts: async parent => {
      return collectionManuscripts(parent)
    },
  },

  PublishingCollectionFormData: {
    file: async parent => {
      return collectionFormDataFile(parent)
    },

    image: async parent => {
      return collectionFormDataImage(parent)
    },
  },
}

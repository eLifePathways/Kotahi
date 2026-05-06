const { createFile, deleteFiles, File } = require('@coko/server')

const { Manuscript, PublishingCollection } = require('../models')
const { getFileWithUrl } = require('../utils/fileStorageUtils')

const collectionFormDataFile = async collectionFormData => {
  let file = null

  if (collectionFormData.image !== '') {
    file = await File.query().findOne({ id: collectionFormData.image })
  }

  return file
}

const collectionFormDataImage = async collectionFormData => {
  // Return the image field from the formData object within the parent (metadata) object
  const file = await File.query().findOne({ id: collectionFormData.image })

  if (file) {
    const data = await getFileWithUrl(file)
    return data.storedObjects.find(img => img.type === 'small')?.url
  }

  return ''
}

const collectionManuscripts = async collection => {
  if (collection.manuscripts?.length) {
    const manuscripts = await Manuscript.query().whereIn(
      'id',
      collection.manuscripts,
    )

    return collection.manuscripts.map(id => manuscripts.find(m => m.id === id))
  }

  return []
}

const createCollection = async (input, groupId) => {
  let publishingCollection = await PublishingCollection.query()
    .insert({
      active: input.active,
      formData: {
        ...input.formData,
        image: null,
      },
      groupId,
      manuscripts: input.manuscripts,
    })
    .returning('*')

  if (input.formData.image) {
    const { filename, createReadStream: stream } = await input.formData.image

    const file = await createFile(stream(), filename, {
      tags: ['publishingCollection'],
      objectId: publishingCollection.id,
    })

    publishingCollection = await PublishingCollection.query()
      .patch({
        formData: {
          ...publishingCollection.formData,
          image: file.id,
        },
      })
      .findOne({ id: publishingCollection.id })
      .returning('*')
  }

  publishingCollection.formData.active = publishingCollection.active

  return publishingCollection
}

const deleteCollection = async id => {
  try {
    const collection = await PublishingCollection.query()
      .delete()
      .findOne({ id })
      .returning('*')

    await deleteFiles([collection.formData.image])
    return { success: true }
    /* eslint-disable-next-line */
  } catch (e) {
    return { success: false }
  }
}

const getPublishingCollections = async groupId => {
  const publishingCollection = await PublishingCollection.query().where({
    groupId,
  })

  return publishingCollection.map(col => {
    return { ...col, formData: { ...col.formData, active: col.active } }
  })
}

const updateCollection = async (id, input) => {
  const collection = await PublishingCollection.query().findOne({
    id,
  })

  let file = null

  if (input.formData.image) {
    if (collection.formData.image) {
      await deleteFiles([collection.formData.image])
    }

    const { filename, createReadStream: stream } = await input.formData.image

    file = await createFile(stream(), filename, {
      tags: ['publishingCollection'],
      objectId: id,
    })
  } else if (collection.formData.image && input.formData.image === null) {
    await deleteFiles([collection.formData.image])
  }

  const publishingCollection =
    await PublishingCollection.query().updateAndFetchById(id, {
      ...input,
      formData: {
        ...input.formData,
        image: file ? file.id : collection.formData.image,
      },
    })

  publishingCollection.formData.active = publishingCollection.active

  return publishingCollection
}

module.exports = {
  collectionFormDataFile,
  collectionFormDataImage,
  collectionManuscripts,
  createCollection,
  deleteCollection,
  getPublishingCollections,
  updateCollection,
}

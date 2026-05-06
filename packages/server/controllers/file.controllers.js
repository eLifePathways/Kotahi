const { fileStorage, createFile, deleteFiles, File } = require('@coko/server')
const { map, uniq, flatten } = require('lodash')
const { decrypt } = require('../utils/encryptDecryptUtils')
const Form = require('../models/form/form.model')

const { Manuscript } = require('../models')

const {
  getFileWithUrl,
  getFilesWithUrl,
  imageFinder,
} = require('../utils/fileStorageUtils')

const createFileFn = async (file, meta) => {
  const { createReadStream, filename } = await file
  const fileStream = createReadStream()

  const options = {}
  const tags = []

  if (meta.formElementId) {
    const form = await Form.query()

    const formsElements = flatten(form.map(f => f.structure.children))

    const element = formsElements.find(el => el.id === meta.formElementId)

    const manuscript = await Manuscript.query()
      .findById(meta.manuscriptId)
      .select('parentId', 'shortId')

    if (element.isS3Component) {
      if (element.uploadAttachmentSource === 'external') {
        options.s3 = {
          accessKeyId: element.s3AccessId
            ? decrypt(element.s3AccessId)
            : element.s3AccessId,
          secretAccessKey: element.s3AccessToken
            ? decrypt(element.s3AccessToken)
            : element.s3AccessToken,
          bucket: element.s3Bucket || manuscript.shortId,
          region: element.s3Region,
          url: element.s3Url,
        }

        options.meta = { formElementId: element.id, bucket: options.s3.bucket }

        tags.push('externalAttachmentSource')
      }

      options.forceObjectKeyValue = `${
        manuscript.parentId || meta.manuscriptId
      }/${filename}`
    }
  }

  const createdFile = await createFile(fileStream, filename, {
    tags: [meta.fileType, ...tags],
    objectId: meta.reviewId || meta.manuscriptId,
    ...options,
  })

  const data = await getFileWithUrl(createdFile, options)

  return data
}

const deleteFile = async id => {
  const options = {
    removeFromFileServer: true,
  }

  const file = await File.findById(id)

  if (
    file.meta.formElementId &&
    file.tags.includes('externalAttachmentSource')
  ) {
    const forms = await Form.query()
    const formsElements = flatten(forms.map(f => f.structure.children))

    const element = formsElements.find(el => el.id === file.meta.formElementId)

    options.s3 = {
      accessKeyId: element.s3AccessId
        ? decrypt(element.s3AccessId)
        : element.s3AccessId,
      secretAccessKey: element.s3AccessToken
        ? decrypt(element.s3AccessToken)
        : element.s3AccessToken,
      bucket: element.s3Bucket,
      region: element.s3Region,
      url: element.s3Url,
    }
  }

  await deleteFiles([id], options)
  return id
}

const deleteFilesFn = async ids => {
  await deleteFiles(ids, { removeFromFileServer: true })
  return ids
}

const getEntityFiles = async input => {
  const { entityId, sortingParams, includeInUse = false } = input

  let files = []

  if (sortingParams) {
    const orderByParams = sortingParams.map(option => {
      const { key, order } = option
      return { column: key, order }
    })

    files = await File.query()
      .where({ objectId: entityId })
      .orderBy(orderByParams)
  } else {
    files = await File.query().where({ objectId: entityId })
  }

  const imageFiles = files.filter(file => file.tags.includes('manuscriptImage'))

  if (includeInUse) {
    const manuscript = await Manuscript.query()
      .findById(entityId)
      .select('id', 'meta')

    if (manuscript) {
      imageFiles.forEach(file => {
        const foundIn = []
        const { source } = manuscript.meta

        if (source && typeof source === 'string') {
          if (imageFinder(source, file.id)) {
            foundIn.push(manuscript.id)
          }
        }

        file.inUse = foundIn.length > 0
      })
    }
  }

  const data = await getFilesWithUrl(imageFiles)
  return data
}

const getSpecificFiles = async ids => {
  const files = await File.query().whereIn('id', ids)

  const data = await getFilesWithUrl(files)
  return data
}

const getFilesByTagOrId = async input => {
  const { objectId, tag, id } = input

  let files = []

  if (tag) {
    files = await File.query()
      .where({ objectId })
      .andWhere('tags', '@>', JSON.stringify([tag]))
  }

  if (id) {
    files = await File.query().where({ id })
  }

  const data = await getFilesWithUrl(files)
  return data
}

const updateFile = async input => {
  const { id, name, alt } = input

  const updatedFile = await File.query().patchAndFetchById(id, {
    name,
    alt,
  })

  return updatedFile
}

const updateTagsFile = async input => {
  const { removeTags, addTags, id } = input

  const file = await File.query().findById(id)
  let updatedTags = file.tags

  if (removeTags) {
    updatedTags = updatedTags.filter(tag => !removeTags.includes(tag))
  }

  if (addTags) {
    updatedTags = uniq(updatedTags.concat(addTags))
  }

  const updatedFile = await File.query().patchAndFetchById(id, {
    tags: updatedTags,
  })

  return updatedFile
}

const uploadFile = async file => {
  const { createReadStream, filename } = await file
  const fileStream = createReadStream()
  const storedObjects = await fileStorage.upload(fileStream, filename)
  storedObjects[0].url = await fileStorage.getURL(storedObjects[0].key)

  const data = {
    name: filename,
    storedObjects,
  }

  return data
}

const uploadFiles = async (files, fileType, entityId) => {
  const uploadedFiles = await Promise.all(
    map(files, async file => {
      const { createReadStream, filename } = await file
      const fileStream = createReadStream()

      const createdFile = await createFile(fileStream, filename, {
        alt: filename,
        tags: [fileType],
        objectId: entityId,
      })

      const data = await getFileWithUrl(createdFile)

      return data
    }),
  )

  return uploadedFiles
}

module.exports = {
  createFile: createFileFn,
  deleteFile,
  deleteFiles: deleteFilesFn,
  getEntityFiles,
  getFilesByTagOrId,
  getSpecificFiles,
  updateFile,
  updateTagsFile,
  uploadFile,
  uploadFiles,
}

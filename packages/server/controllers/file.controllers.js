const {
  createFile,
  deleteFiles,
  File,
  fileStorage,
  FileStorageConstructor,
  serverUrl,
  uuidValidate,
} = require('@coko/server')
const { map, uniq, flatten, get } = require('lodash')
const { decrypt } = require('../utils/encryptDecryptUtils')
const Form = require('../models/form/form.model')

const { Manuscript, Review } = require('../models')

const {
  getFileWithUrl,
  getFilesWithUrl,
  imageFinder,
} = require('../utils/fileStorageUtils')

const { bodyImageIds } = require('../utils/htmlUtils')
const { publishedFormFields } = require('./manuscript/manuscriptUtils')
const {
  getDecisionForm,
  getReviewForm,
  getSubmissionForm,
  isReviewFileField,
  toFileIds,
} = require('./review.controllers')

const FILE_COMPONENT_TAGS = {
  ManuscriptFile: 'manuscript',
  SupplementaryFiles: 'supplementary',
  VisualAbstract: 'visualAbstract',
}

const createFileFn = async (file, meta) => {
  const { createReadStream, filename } = await file
  const fileStream = createReadStream()

  const options = {}
  const tags = []

  if (meta.formElementId) {
    const { result: form } = await Form.find({})

    const formsElements = flatten(form.map(f => f.structure.children))

    const element = formsElements.find(el => el.id === meta.formElementId)

    const manuscript = await Manuscript.findById(meta.manuscriptId, {
      throwIfNotFound: false,
    })

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
    const { result: forms } = await Form.find({})
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

    files = (
      await File.find({ objectId: entityId }, { orderBy: orderByParams })
    ).result
  } else {
    files = (await File.find({ objectId: entityId })).result
  }

  const imageFiles = files.filter(file => file.tags.includes('manuscriptImage'))

  if (includeInUse) {
    const manuscript = await Manuscript.findById(entityId, {
      throwIfNotFound: false,
    })

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
  const files = await File.findByIds(ids, { throwIfNotFound: false })

  const data = await getFilesWithUrl(files)
  return data
}

const getFilesByTagOrId = async input => {
  const { objectId, tag, id } = input

  let files = []

  if (tag) {
    const { result: objectFiles } = await File.find({ objectId })
    files = objectFiles.filter(file => file.tags.includes(tag))
  }

  if (id) {
    files = (await File.find({ id })).result
  }

  const data = await getFilesWithUrl(files)
  return data
}

const updateFile = async input => {
  const { id, name, alt } = input

  return File.patchAndFetchById(id, { name, alt })
}

const updateTagsFile = async input => {
  const { removeTags, addTags, id } = input

  const file = await File.findById(id)
  let updatedTags = file.tags

  if (removeTags) {
    updatedTags = updatedTags.filter(tag => !removeTags.includes(tag))
  }

  if (addTags) {
    updatedTags = uniq(updatedTags.concat(addTags))
  }

  const updatedFile = await File.patchAndFetchById(id, {
    tags: updatedTags,
  })

  return updatedFile
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

const fileFieldTag = field =>
  field.component === 'GenericFiles'
    ? field.name
    : FILE_COMPONENT_TAGS[field.component]

const isFileField = field => !!fileFieldTag(field)

const filesForField = (files, field) => {
  const tag = fileFieldTag(field)
  if (!tag) return []

  return files.filter(file => file.tags?.includes(tag))
}

const externalStorage = (file, formFields) => {
  const element = formFields.find(
    field => field.id === file.meta?.formElementId,
  )
  if (!element) return null

  return new FileStorageConstructor({
    accessKeyId: element.s3AccessId
      ? decrypt(element.s3AccessId)
      : element.s3AccessId,
    secretAccessKey: element.s3AccessToken
      ? decrypt(element.s3AccessToken)
      : element.s3AccessToken,
    bucket: file.meta.bucket || element.s3Bucket,
    region: element.s3Region,
    url: element.s3Url,
  })
}

const isPublicFile = (file, manuscript, formFields) => {
  if (!manuscript.published || file.objectId !== manuscript.id) return false
  if (bodyImageIds(manuscript.meta?.source).includes(file.id)) return true

  return publishedFormFields(manuscript, formFields).some(
    field => filesForField([file], field).length > 0,
  )
}

const isPublicReviewFile = (file, review, manuscript, formFields) => {
  if (
    !manuscript.published ||
    file.objectId !== review.id ||
    review.manuscriptId !== manuscript.id
  )
    return false

  const data = review.jsonData ?? {}

  return publishedFormFields(manuscript, formFields, review.id).some(
    field =>
      isReviewFileField(field) &&
      toFileIds(get(data, field.name)).includes(file.id),
  )
}

const publicFileFormFields = async file => {
  const manuscript = await Manuscript.findById(file.objectId, {
    throwIfNotFound: false,
  })

  if (manuscript) {
    const form = await getSubmissionForm(manuscript.groupId)
    const formFields = form.getFields()
    return isPublicFile(file, manuscript, formFields) ? formFields : null
  }

  const review = await Review.findById(file.objectId, {
    throwIfNotFound: false,
  })
  if (!review) return null

  const reviewManuscript = await Manuscript.findById(review.manuscriptId, {
    throwIfNotFound: false,
  })

  if (!reviewManuscript) return null

  if (!review.isDecision) {
    const completed = await Manuscript.getReviews(reviewManuscript.id, [
      'completed',
    ])

    if (!completed.some(completedReview => completedReview.id === review.id))
      return null
  }

  const form = review.isDecision
    ? await getDecisionForm(reviewManuscript.groupId)
    : await getReviewForm(reviewManuscript.groupId)

  const formFields = form.getFields()

  return isPublicReviewFile(file, review, reviewManuscript, formFields)
    ? formFields
    : null
}

const publicFileUrl = file => `${serverUrl}/api/files/${file.id}`

const publishedFileUrl = async (fileId, size = 'original') => {
  if (!uuidValidate(fileId)) return null

  const file = await File.findById(fileId, { throwIfNotFound: false })
  if (!file?.objectId) return null

  const formFields = await publicFileFormFields(file)
  if (!formFields) return null

  const storedObject = file.storedObjects.find(object => object.type === size)
  if (!storedObject) return null

  const storage = file.tags?.includes('externalAttachmentSource')
    ? externalStorage(file, formFields)
    : fileStorage

  if (!storage) return null

  const url = await storage.getURL(storedObject.key, {
    /**
     * Keep expiration short. If a manuscript is unpublished, the file should
     * stop being available fairly quickly.
     */
    expiresIn: 300, // 5 minutes
  })

  return url || null
}

module.exports = {
  createFile: createFileFn,
  deleteFile,
  deleteFiles: deleteFilesFn,
  filesForField,
  getEntityFiles,
  getFilesByTagOrId,
  getSpecificFiles,
  isFileField,
  isPublicFile,
  isPublicReviewFile,
  publicFileUrl,
  publishedFileUrl,
  updateFile,
  updateTagsFile,
  uploadFiles,
}

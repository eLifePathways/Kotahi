const fs = require('fs-extra')

const { createFile, fileStorage, File } = require('@coko/server')

const ArticleTemplate = require('../models/articleTemplate/articleTemplate.model')
const { getFilesWithUrl } = require('../utils/fileStorageUtils')

const uploadAsset = async (files, fileType, groupTemplateId, options = {}) => {
  const tags = ['templateGroupAsset']

  if (options.isCms === 'true') tags.push('isCms')
  if (options.isPdf === 'true') tags.push('isPdf')

  await Promise.all(
    files.map(async f => {
      const insertedFile = await createFile(
        fs.createReadStream(`${f.path}`),
        f.originalname,
        {
          tags,
          objectId: groupTemplateId,
        },
      )

      if (fileType === 'javascript' || fileType === 'css') {
        const file = await File.query().findOne({ id: insertedFile.id })

        if (file.storedObjects) {
          const storedObjects = file.storedObjects.map(storedObject => {
            storedObject.mimetype = `text/${fileType}`
            return storedObject
          })

          await File.query().patchAndFetchById(insertedFile.id, {
            storedObjects,
          })
        }
      }
    }),
  )

  const templateFiles =
    await ArticleTemplate.relatedQuery('files').for(groupTemplateId)

  const filesWithUrl = await getFilesWithUrl(templateFiles)
  return filesWithUrl
}

const deleteAsset = async id => {
  const file = await File.findById(id)
  const keys = file.storedObjects.map(f => f.key)

  try {
    if (keys.length > 0) {
      await fileStorage.delete(keys)
      await File.query().deleteById(id)
    }

    const templateFiles = await ArticleTemplate.relatedQuery('files').for(
      file.objectId,
    )

    const filesWithUrl = await getFilesWithUrl(templateFiles)
    return filesWithUrl
  } catch (e) {
    throw new Error(`The was a problem deleting the file: ${e.message}`)
  }
}

module.exports = { uploadAsset, deleteAsset }

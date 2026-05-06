const { Readable } = require('stream')

const { File, fileStorage, request } = require('@coko/server')

const { ArticleTemplate, CmsFileTemplate } = require('../models')

const { getFilesWithUrl, getFileWithUrl } = require('../utils/fileStorageUtils')

const getArticleTemplate = async (groupId, isCms) => {
  return ArticleTemplate.query().findOne({ groupId, isCms }).throwIfNotFound()
}

const getTemplateArticle = async articleTemplate => {
  if (articleTemplate.isCms === true) {
    const articleFile = await searchArticleTemplate(articleTemplate.groupId)
    if (!articleFile) return ''
    const file = await File.query().findById(articleFile.fileId)

    const { storedObjects } = await getFileWithUrl(file)

    const fileUrl = storedObjects.find(f => f.type === 'original')

    const response = await request({
      method: 'get',
      url: fileUrl.url,
    })

    return response.data.toString()
  }

  return articleTemplate.article
}

const getTemplateFiles = async articleTemplate => {
  return getFilesWithUrl(
    await File.query().where({ objectId: articleTemplate.groupId }),
  )
}

const searchArticleTemplate = async groupId => {
  const groupFiles = await CmsFileTemplate.query().where({
    groupId,
  })

  const rootNode = groupFiles.find(gf => gf.rootFolder === true)

  const layoutsFolder = groupFiles.find(
    gf => gf.parentId === rootNode.id && gf.name === 'layouts',
  )

  return (
    groupFiles.find(
      gf =>
        gf.parentId === layoutsFolder.id && gf.name === 'article-preview.njk',
    ) || null
  )
}

const updateTemplate = async (id, input) => {
  const result = await ArticleTemplate.query().findOne({ id })

  // Needs to be revisited. This is a temp Solution
  // In case we want to update the article template of the CMS we need to do that on the S3
  // Not in ArticleTemplate table
  if (result.isCms === true) {
    const articleFile = await searchArticleTemplate(result.groupId)

    if (articleFile) {
      const file = await File.query().findById(articleFile.fileId)

      const { key } = file.storedObjects.find(obj => obj.type === 'original')

      await fileStorage.upload(Readable.from(input.article), file.name, {
        forceObjectKeyValue: key,
      })
    }

    input.article = ''
  }

  return ArticleTemplate.query().patchAndFetchById(id, input).throwIfNotFound()
}

module.exports = {
  getArticleTemplate,
  getTemplateArticle,
  getTemplateFiles,
  updateTemplate,
}

const { Readable } = require('stream')

const {
  createFile,
  fileStorage,
  request,
  File,
  logger,
} = require('@coko/server')

const {
  ArticleTemplate,
  CmsFileTemplate,
  CmsLayout,
  CmsPage,
  Config,
  PublishingCollection,
} = require('../models')

const {
  getFileWithUrl,
  getFilesWithUrl,
  replaceImageFromNunjucksTemplate,
  replaceImageSrc,
  setFileUrls,
} = require('../utils/fileStorageUtils')

const sanitizeWaxImages = require('../utils/sanitizeWaxImages')

const addResourceToFolder = async (id, type) => {
  const parent = await CmsFileTemplate.query().findOne({ id })

  const name = type ? 'new folder' : 'new file.njk'

  const insertedResource = await CmsFileTemplate.query()
    .insertGraph({
      name,
      parentId: parent.id,
      groupId: parent.groupId,
    })
    .returning('id')

  let fileId = null

  if (!type) {
    const insertedFile = await createFile(Readable.from(' '), name, {
      tags: ['cmsTemplateFile'],
      objectId: insertedResource.id,
    })

    fileId = insertedFile.id

    await CmsFileTemplate.query()
      .update({ fileId })
      .where({ id: insertedResource.id })

    return {
      id: insertedResource.id,
      fileId,
      name,
    }
  }

  return {
    id: insertedResource.id,
    fileId: null,
    name,
    children: [],
  }
}

const addSlashes = inputString => {
  let str = inputString

  if (!inputString.startsWith('/')) {
    str = `/${inputString}`
  }

  if (!inputString.endsWith('/')) {
    str = `${inputString}/`
  }

  return str
}

const cleanCMSPageInput = async inputData => {
  const attrs = { ...inputData }

  if (attrs.content) {
    attrs.content = await sanitizeWaxImages(attrs.content)
  }

  if (attrs.url) {
    attrs.url = addSlashes(attrs.url)
  }

  return attrs
}

const cmsFileTree = async (groupId, folderId) => {
  const AllFiles = await CmsFileTemplate.query().where('groupId', groupId)

  const fileIds = AllFiles.filter(file => file.fileId !== null).map(
    f => f.fileId,
  )

  const files = await File.query().whereIn('id', fileIds)
  const filesWithUrl = await getFilesWithUrl(files)

  const getChildren = children =>
    children.map(child => {
      const nestedChildren = AllFiles.filter(f => f.parentId === child.id)
      const file = filesWithUrl.find(fu => fu.id === child.fileId)

      const fileUrl = file
        ? file.storedObjects.find(f => f.type === 'original')
        : { url: null }

      return {
        id: child.id,
        name: child.name,
        children: getChildren(nestedChildren),
        fileId: child.fileId,
        url: fileUrl.url,
      }
    })

  const rootNode = folderId
    ? AllFiles.find(f => f.id === folderId)
    : AllFiles.find(f => f.parentId === null)

  const children = AllFiles.filter(f => f.parentId === rootNode.id)

  return {
    id: rootNode.id,
    name: rootNode.name,
    children: getChildren(children),
    fileId: null,
    url: null,
  }
}

const cmsLayout = async groupId => {
  let layout = await CmsLayout.query().where('groupId', groupId).first()

  if (!layout) {
    // TODO move this to seedArticleTemplate.js or similar
    layout = await setInitialLayout(groupId)
  }

  return layout
}

const cmsPageById = async id => {
  return CmsPage.query().findById(id)
}

const cmsPages = async groupId => {
  return CmsPage.query().where('groupId', groupId).orderBy('title')
}

const createCMSPage = async (groupId, input) => {
  try {
    const cleanedInput = await cleanCMSPageInput(input)

    const savedCmsPage = await CmsPage.query().insert({
      ...cleanedInput,
      groupId,
    })

    const cmsPage = await CmsPage.query().findById(savedCmsPage.id)
    return { success: true, error: null, cmsPage }
  } catch (e) {
    if (e.constraint === 'cms_pages_url_group_id_key') {
      return {
        success: false,
        error: e.constraint,
        column: 'url',
        errorMessage: 'Url already taken.',
      }
    }

    return { success: false, error: 'Something went wrong.' }
  }
}

const deleteCMSPage = async id => {
  try {
    const response = await CmsPage.query().delete().where({ id })

    if (response) {
      return {
        success: true,
      }
    }

    return {
      success: false,
      error: `Something went wrong`,
    }
  } catch (err) {
    return {
      success: false,
      error: `Something went wrong. ${err.message}`,
    }
  }
}

const deleteResource = async id => {
  const item = await CmsFileTemplate.query().findOne({ id })

  if (item.fileId) {
    await CmsFileTemplate.query().findOne({ id }).delete()
    const file = await File.query().findOne({ id: item.fileId })
    const keys = file.storedObjects.map(f => f.key)

    try {
      if (keys.length > 0) {
        await fileStorage.delete(keys)
        await File.query().deleteById(id)
      }
    } catch (e) {
      throw new Error(`The was a problem deleting the file: ${e.message}`)
    }
  } else {
    const hasChildren = await CmsFileTemplate.query().where({
      parentId: item.id,
    })

    if (hasChildren.length === 0) {
      await CmsFileTemplate.query().findOne({ id }).delete()
    }
  }

  return {
    id: item.id,
    fileId: item.fileId,
    name: item.name,
    parentId: item.parentId,
  }
}

const getActiveCmsFilesTree = async groupId => {
  const cmsFileTemplate = await CmsFileTemplate.query().findOne({
    groupId,
    rootFolder: true,
  })

  return JSON.stringify(await cmsFileTree(groupId, cmsFileTemplate.id))
}

const getCmsFileContent = async id => {
  const file = await File.query().findById(id)

  const { storedObjects } = await getFileWithUrl(file)

  const fileUrl = storedObjects.find(f => f.type === 'original')

  const response = await request({
    method: 'get',
    url: fileUrl.url,
  })

  return {
    id,
    content:
      typeof response.data === 'object'
        ? JSON.stringify(response.data)
        : response.data.toString(),
    name: file.name,
    url: fileUrl.url,
  }
}

const getFlaxPageConfig = async (configKey, groupId) => {
  const pages = await CmsPage.query()
    .where('groupId', groupId)
    .select(['id', 'title', 'url', configKey])
    .orderBy('title')

  if (!pages) return []

  return pages
    .map(page => ({
      id: page.id,
      title: page.title,
      url: page.url,
      shownInMenu: page[configKey].shownInMenu,
      sequenceIndex: page[configKey].sequenceIndex,
    }))
    .sort((page1, page2) => {
      if (page1.sequenceIndex < page2.sequenceIndex) return -1
      if (page1.sequenceIndex > page2.sequenceIndex) return 1
      return 0
    })
}

const getFoldersList = async groupId => {
  let folderArray = []

  const AllFiles = await CmsFileTemplate.query().where({ groupId })
  const folders = AllFiles.filter(file => file.fileId === null)

  const rootNodes = AllFiles.filter(f => f.parentId === null).map(f => ({
    ...f,
    name: `/${f.name}`,
  }))

  const getChildren = children =>
    children.forEach(child => {
      const nestedChildren = folders
        .filter(f => f.parentId === child.id)
        .map(cld => ({
          ...cld,
          name: `${child.name}/${cld.name}`,
        }))

      folderArray = folderArray.concat(nestedChildren)
      // getChildren(nestedChildren)
    })

  rootNodes.forEach(node => {
    // folderArray.push(node)
    getChildren([node])
  })

  return folderArray
}

const layoutArticle = async layout => {
  if (layout.article || layout.article === '') return layout.article

  const { article } = await ArticleTemplate.query().findOne({
    groupId: layout.groupId,
    isCms: true,
  })

  let files = await File.query().where({ objectId: layout.groupId })
  files = await getFilesWithUrl(files)

  return replaceImageFromNunjucksTemplate(article, files, 'medium') ?? ''
}

const layoutCss = async layout => {
  if (layout.css || layout.css === '') return layout.css

  const { css } = await ArticleTemplate.query().findOne({
    groupId: layout.groupId,
    isCms: true,
  })

  return css ?? ''
}

const layoutFavicon = async layout => {
  try {
    const { groupId } = layout

    const activeConfig = await Config.query().findOne({
      groupId,
      active: true,
    })

    const file = await File.findById(
      activeConfig.formData.groupIdentity.favicon,
    )

    file.storedObjects = await setFileUrls(file.storedObjects)
    return file
  } catch (error) {
    logger.error(error)
    return null
  }
}

const layoutFlaxFooterConfig = async layout => {
  return getFlaxPageConfig('flaxFooterConfig', layout.groupId)
}

const layoutFlaxHeaderConfig = async layout => {
  return getFlaxPageConfig('flaxHeaderConfig', layout.groupId)
}

const layoutLogo = async layout => {
  if (!layout.logoId) {
    return null
  }

  const logoFile = await CmsLayout.relatedQuery('logo').for(layout.id).first()

  const updatedStoredObjects = await setFileUrls(logoFile.storedObjects)

  logoFile.storedObjects = updatedStoredObjects
  return logoFile
}

const layoutPublishConfig = async layout => {
  const { formData } = await Config.getCached(layout.groupId)

  return JSON.stringify({
    licenseUrl: formData.publishing.crossref.licenseUrl,
    title: formData.groupIdentity.title,
    description: formData.groupIdentity.description,
    contact: formData.groupIdentity.contact,
    issn: formData.groupIdentity.issn,
    electronicIssn: formData.groupIdentity.electronicIssn,
    logoPath: formData.groupIdentity.logoPath,
  })
}

const layoutPublishingCollection = async layout => {
  return PublishingCollection.query().where({
    groupId: layout.groupId,
    active: true,
  })
}

const pageContent = async page => {
  if (!page.content) return page.content

  let files = await File.query().where('object_id', page.id)
  files = await getFilesWithUrl(files)

  return replaceImageSrc(page.content, files, 'medium')
}

const pageCreator = async page => {
  if (!page.creatorId) {
    return null
  }

  return CmsPage.relatedQuery('creator').for(page.id).first()
}

const pageMeta = page => {
  if (page.meta) {
    return JSON.stringify({
      ...page.meta,
      title: page.submission.$title,
      abstract: page.submission.$abstract,
    }) // TODO update flax so we can remove these bogus title and abstract fields
  }

  return null
}

const renameResource = async (id, name) => {
  const item = await CmsFileTemplate.query().findOne({ id })

  const updatedItem = await CmsFileTemplate.query()
    .patch({ name })
    .findOne({ id })
    .returning('*')

  if (item.fileId) {
    await File.query().patch({ name }).findOne({ id: item.fileId })
  }

  return updatedItem
}

const setInitialLayout = async groupId => {
  const { formData } = await Config.getCached(groupId)
  const { primaryColor, secondaryColor } = formData.groupIdentity

  const layout = await CmsLayout.query().insert({
    primaryColor,
    secondaryColor,
    groupId,
  })

  return layout
}

const storedPartnerFile = async storedPartner => {
  try {
    const file = await File.findById(storedPartner.id)
    const updatedStoredObjects = await setFileUrls(file.storedObjects)
    file.storedObjects = updatedStoredObjects
    return file
  } catch (err) {
    logger.error(err)
    return null
  }
}

const updateCMSLayout = async (groupId, input) => {
  const layout = await CmsLayout.query().where('groupId', groupId).first()
  if (!layout) return CmsLayout.query().insert(input)
  return CmsLayout.query().updateAndFetchById(layout.id, input)
}

const updateCMSPage = async (id, userId, input) => {
  const attrs = await cleanCMSPageInput(input)

  if (!input.creatorId) {
    attrs.creatorId = userId
  }

  const cmsPage = await CmsPage.query().updateAndFetchById(id, attrs)
  return cmsPage
}

const updateFlaxRootFolder = async (id, groupId) => {
  await CmsFileTemplate.query().patch({ rootFolder: false }).where({ groupId })

  return CmsFileTemplate.query()
    .patch({ rootFolder: true })
    .findOne({ id, groupId })
    .returning('*')
}

const updateResource = async (id, content) => {
  const file = await File.query().findOne({ id })

  const { key } = file.storedObjects.find(obj => obj.type === 'original')

  await fileStorage.upload(Readable.from(content), file.name, {
    forceObjectKeyValue: key,
  })

  return { id, content }
}

module.exports = {
  addResourceToFolder,
  cmsFileTree,
  cmsLayout,
  cmsPageById,
  cmsPages,
  createCMSPage,
  deleteCMSPage,
  deleteResource,
  getActiveCmsFilesTree,
  getCmsFileContent,
  getFoldersList,
  layoutArticle,
  layoutCss,
  layoutFavicon,
  layoutFlaxFooterConfig,
  layoutFlaxHeaderConfig,
  layoutLogo,
  layoutPublishConfig,
  layoutPublishingCollection,
  pageContent,
  pageCreator,
  pageMeta,
  renameResource,
  storedPartnerFile,
  updateCMSLayout,
  updateCMSPage,
  updateFlaxRootFolder,
  updateResource,
}

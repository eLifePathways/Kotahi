const fs = require('fs-extra')

const { createFile } = require('@coko/server')

const { CmsFileTemplate } = require('../models')

const uploadCms = async (templateId, files) => {
  const folder = await CmsFileTemplate.query().findOne({ id: templateId })

  return Promise.all(
    files.map(async file => {
      const insertedResource = await CmsFileTemplate.query()
        .insertGraph({
          name: file.originalname,
          parentId: folder.id,
          groupId: folder.groupId,
        })
        .returning('id')

      const insertedFile = await createFile(
        fs.createReadStream(`${file.path}`),
        file.originalname,
        {
          tags: ['cmsTemplateFile'],
          objectId: insertedResource.id,
        },
      )

      return CmsFileTemplate.query()
        .update({ fileId: insertedFile.id })
        .where({ id: insertedResource.id })
        .returning('*')
    }),
  )
}

module.exports = { uploadCms }

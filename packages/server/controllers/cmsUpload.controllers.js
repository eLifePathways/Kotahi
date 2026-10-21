const fs = require('fs')

const { createFile, useTransaction } = require('@coko/server')

const { CmsFileTemplate } = require('../models')

const uploadCms = async (templateId, files) => {
  return useTransaction(async trx => {
    const folder = await CmsFileTemplate.findOne({ id: templateId }, { trx })

    return Promise.all(
      files.map(async file => {
        const insertedResource = await CmsFileTemplate.query(trx)
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
            trx,
            objectId: insertedResource.id,
          },
        )

        return CmsFileTemplate.query(trx)
          .update({ fileId: insertedFile.id })
          .where({ id: insertedResource.id })
          .returning('*')
      }),
    )
  })
}

module.exports = { uploadCms }

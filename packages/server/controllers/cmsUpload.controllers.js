const fs = require('fs')

const { createFile, useTransaction } = require('@coko/server')

const { CmsFileTemplate } = require('../models')

const uploadCms = async (templateId, files) => {
  return useTransaction(async trx => {
    const folder = await CmsFileTemplate.findOne({ id: templateId }, { trx })

    return Promise.all(
      files.map(async file => {
        const insertedResource = await CmsFileTemplate.insert(
          {
            name: file.originalname,
            parentId: folder.id,
            groupId: folder.groupId,
          },
          { trx },
        )

        const insertedFile = await createFile(
          fs.createReadStream(`${file.path}`),
          file.originalname,
          {
            tags: ['cmsTemplateFile'],
            trx,
            objectId: insertedResource.id,
          },
        )

        return [
          await CmsFileTemplate.patchAndFetchById(
            insertedResource.id,
            { fileId: insertedFile.id },
            { trx },
          ),
        ]
      }),
    )
  })
}

module.exports = { uploadCms }

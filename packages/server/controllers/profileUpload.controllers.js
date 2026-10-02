const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

const { createFile, deleteFiles, useTransaction } = require('@coko/server')

const User = require('../models/user/user.model')

const profileUpload = async (userId, filePath) => {
  const user = await User.findById(userId)
  const previousProfilePictureId = user.profilePicture

  await useTransaction(async trx => {
    const raw = await crypto.randomBytes(16)

    const createdProfilePicture = await createFile(
      fs.createReadStream(filePath),
      `${raw.toString('hex')}${path.extname(filePath)}`,
      {
        tags: ['profilePicture'],
        objectId: user.id,
        trx,
      },
    )

    await User.patchById(
      userId,
      { profilePicture: createdProfilePicture.id },
      { trx },
    )
  })

  if (previousProfilePictureId) {
    deleteFiles([previousProfilePictureId])
  }
}

module.exports = { profileUpload }

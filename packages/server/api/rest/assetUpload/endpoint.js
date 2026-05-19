const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')

const {
  uploadAsset,
  deleteAsset,
} = require('../../../controllers/assetUpload.controllers')

const authBearer = passport.authenticate('bearer', { session: false })

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, raw) => {
      if (err) {
        cb(err)
        return
      }

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10000000, files: 10 },
})

module.exports = app => {
  app.post(
    '/api/uploadAsset',
    authBearer,
    upload.array('files'),
    async (req, res) => {
      const { body, files } = req
      const { isCms, isPdf, groupTemplateId, fileType } = body

      const responseData = await uploadAsset(files, fileType, groupTemplateId, {
        isCms,
        isPdf,
      })

      return res.send(responseData)
    },
  )

  app.post('/api/deleteAsset', authBearer, async (req, res) => {
    const { id } = req.body
    const responseData = await deleteAsset(id)
    return res.send(responseData)
  })
}

const crypto = require('crypto')
const path = require('path')
const multer = require('multer')
const passport = require('passport')

const { uploadCms } = require('../../../controllers/cmsUpload.controllers')

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
    '/api/cmsUploadFiles',
    authBearer,
    upload.array('files'),
    async (req, res) => {
      const uploadedFiles = uploadCms(req.body.id, req.files)
      res.send(uploadedFiles)
    },
  )
}

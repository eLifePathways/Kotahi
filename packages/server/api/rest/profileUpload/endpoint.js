const crypto = require('crypto')
const multer = require('multer')
const passport = require('passport')
const path = require('path')

const { config } = require('@coko/server')

const {
  profileUpload,
} = require('../../../controllers/profileUpload.controllers')

const authBearer = passport.authenticate('bearer', { session: false })

const storage = multer.diskStorage({
  destination: config.has('profiles') && config.get('profiles'),
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
  limits: { fileSize: 10000000, files: 1 },
})

module.exports = app => {
  app.post(
    '/api/uploadProfile',
    authBearer,
    upload.single('file'),
    async (req, res) => {
      await profileUpload(req.user, req.file.path)
      res.sendStatus(200)
    },
  )
}

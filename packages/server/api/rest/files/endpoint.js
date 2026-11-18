const { logger } = require('@coko/server')

const { publishedFileUrl } = require('../../../controllers/file.controllers')

const FILE_URL_CACHE_SECONDS = 60

module.exports = app => {
  app.get('/api/files/:id', async (req, res) => {
    try {
      const { size } = req.query

      const url = await publishedFileUrl(
        req.params.id,
        typeof size === 'string' ? size : undefined,
      )

      if (!url) return res.status(404).send({ error: 'File not found' })

      res.set('Cache-Control', `public, max-age=${FILE_URL_CACHE_SECONDS}`)
      return res.redirect(302, url)
    } catch (error) {
      logger.error(error)
      return res.status(500).send({ error: 'Could not get file' })
    }
  })
}

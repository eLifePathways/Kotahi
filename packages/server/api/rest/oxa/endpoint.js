const { logger } = require('@coko/server')

const { manuscriptToOxa } = require('../../../controllers/oxa.controllers')

module.exports = app => {
  app.get('/api/oxa/:manuscriptId', async (req, res) => {
    try {
      const document = await manuscriptToOxa(req.params.manuscriptId)

      if (!document)
        return res.status(404).send({ error: 'Published manuscript not found' })

      return res.json(document)
    } catch (error) {
      logger.error(error)
      return res.status(500).send({ error: 'Could not export manuscript' })
    }
  })
}

const Docmap = require('../../../models/docmap/docmap.model')

module.exports = app => {
  app.get(
    '/api/docmap/group_id/:groupId/doi/:prefix/:doi',
    async (req, res) => {
      const { groupId, prefix, doi } = req.params

      const docmap = await Docmap.query()
        .findOne({ groupId })
        .where('externalId', 'ilike', `%/${prefix}/${doi}`)

      if (!docmap) {
        return res.status(404).send({ error: 'Docmap not found' })
      }

      const responseData = JSON.parse(docmap.content)

      return res.status(200).send(responseData)
    },
  )
}

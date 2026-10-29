const {
  handleIncomingInboxMessage,
} = require('../../../controllers/coar/coar.controllers')

module.exports = async app => {
  app.post('/api/coar/inbox/:group', async (req, res) => {
    const payload = req.body
    const groupName = req.params.group
    const authHeader = req.headers.authorization

    const { message, status } = await handleIncomingInboxMessage(
      payload,
      groupName,
      authHeader,
    )

    res.status(status).send({ message })
  })
}

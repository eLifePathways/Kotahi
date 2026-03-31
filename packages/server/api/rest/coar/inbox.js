const { logger } = require('@coko/server')

const { Group } = require('../../../models')

const {
  processNotification,
  sendUnprocessableCoarNotification,
  validateIPs,
} = require('../../../controllers/coar/coar.controllers')

module.exports = async app => {
  app.post('/api/coar/inbox/:group', async (req, res) => {
    const payload = req.body
    const groupName = req.params.group
    const requestIP = req.socket.localAddress.split(':').pop()

    let message = ''
    let hasError = false

    const group = await Group.query().findOne({ name: groupName })

    if (!group) {
      message = 'Group not found'
      res.status(404).send({ message })
      hasError = true
    }

    if (!hasError && !(await validateIPs(requestIP, group))) {
      message = 'Unauthorized Request'
      res.status(403).send({ message })
      hasError = true
    }

    if (hasError) {
      await sendUnprocessableCoarNotification(message, payload)
      return
    }

    try {
      const { message: processMessage, status } = await processNotification(
        group,
        payload,
      )

      if (status > 299) {
        await sendUnprocessableCoarNotification(processMessage, payload)
      }

      res.status(status).send({ message: processMessage })
    } catch (error) {
      message = 'Failed to create notification.'
      logger.error(error)
      await sendUnprocessableCoarNotification(message, payload)
      res.status(500).send({ message })
    }
  })
}

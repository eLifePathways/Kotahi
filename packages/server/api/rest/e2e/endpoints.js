const path = require('path')
const { readFileSync } = require('fs')

const { logger } = require('@coko/server')

const { resetDbAndApplyDump } = require('../../../scripts/resetDb')
const { applyDump } = require('../../../scripts/resetDb')
const createToken = require('../../../scripts/cypress/createToken')
const seedForms = require('../../../scripts/cypress/seedForms')

const {
  createGroup,
  deleteGroup,
  deleteGroupsByPrefix,
  createManuscripts,
  assignRole,
  setReviewerStatus,
  updateGroupConfig,
  updateFormFields,
  updateManuscriptSubmission,
  patchManuscript,
  setManuscriptCreated,
  deleteSharedUsers,
} = require('./actions')

const dumpFile = name => path.join(__dirname, 'dumps', `${name}.sql`)

module.exports = app => {
  app.post('/api/e2e/restore/:name', async (req, res) => {
    const { name } = req.params

    try {
      await resetDbAndApplyDump(readFileSync(dumpFile(name), 'utf-8'), name)
      res.sendStatus(200)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err })
    }
  })

  app.post('/api/e2e/seed/:name', async (req, res) => {
    const { name } = req.params

    try {
      await applyDump(
        readFileSync(dumpFile(name), 'utf-8'),
        { truncate: false },
        name,
      )

      res.sendStatus(200)
    } catch (err) {
      logger.error(err)
      res.sendStatus(500)
    }
  })

  app.post('/api/e2e/createToken/:username', async (req, res) => {
    const { username } = req.params

    try {
      const token = await createToken(username)
      res.status(200).json({ token })
    } catch (err) {
      logger.error(err)
      res.sendStatus(500)
    }
  })

  app.post('/api/e2e/seedForms', async (req, res) => {
    try {
      await seedForms()
      res.sendStatus(200)
    } catch (err) {
      logger.error(err)
      res.sendStatus(500)
    }
  })

  app.post('/api/e2e/testGroup/:groupName', async (req, res) => {
    const { groupName } = req.params

    try {
      const result = await createGroup(groupName)
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/deleteTestGroup/:groupName', async (req, res) => {
    const { groupName } = req.params

    try {
      await deleteGroup(groupName)
      res.sendStatus(200)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/deleteTestGroupsByPrefix/:prefix', async (req, res) => {
    const { prefix } = req.params

    try {
      const result = await deleteGroupsByPrefix(prefix)
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/deleteSharedUsers', async (req, res) => {
    try {
      const result = await deleteSharedUsers()
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/testGroupConfig/:groupName', async (req, res) => {
    const { groupName } = req.params

    try {
      const patch = JSON.parse(req.query.patch)
      const result = await updateGroupConfig({ groupName, patch })
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post(
    '/api/e2e/updateFormFields/:groupName/:purpose/:category',
    async (req, res) => {
      const { groupName, purpose, category } = req.params

      try {
        const fields = JSON.parse(req.query.fields)

        const result = await updateFormFields({
          groupName,
          purpose,
          category,
          fields,
        })

        res.status(200).json(result)
      } catch (err) {
        logger.error(err)
        res.status(500).json({ error: err.message })
      }
    },
  )

  app.post(
    '/api/e2e/updateManuscriptSubmission/:manuscriptId',
    async (req, res) => {
      const { manuscriptId } = req.params

      try {
        const patch = JSON.parse(req.query.patch)
        const result = await updateManuscriptSubmission({
          manuscriptId,
          patch,
        })

        res.status(200).json(result)
      } catch (err) {
        logger.error(err)
        res.status(500).json({ error: err.message })
      }
    },
  )

  app.post('/api/e2e/patchManuscript/:manuscriptId', async (req, res) => {
    const { manuscriptId } = req.params

    try {
      const patch = JSON.parse(req.query.patch)
      const result = await patchManuscript({ manuscriptId, patch })
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/setManuscriptCreated/:manuscriptId', async (req, res) => {
    const { manuscriptId } = req.params
    const { created } = req.query

    try {
      const result = await setManuscriptCreated({ manuscriptId, created })
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post(
    '/api/e2e/setReviewerStatus/:manuscriptId/:username',
    async (req, res) => {
      const { manuscriptId, username } = req.params
      const { status } = req.query

      try {
        const result = await setReviewerStatus({
          manuscriptId,
          username,
          status,
        })
        res.status(200).json(result)
      } catch (err) {
        logger.error(err)
        res.status(500).json({ error: err.message })
      }
    },
  )

  app.post('/api/e2e/assignRole/:username/:role', async (req, res) => {
    const { username, role } = req.params

    const manuscriptIds = (req.query.manuscriptIds || '')
      .split(',')
      .filter(Boolean)

    try {
      const result = await assignRole({ manuscriptIds, username, role })
      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  app.post('/api/e2e/testManuscripts/:groupName/:count', async (req, res) => {
    const { groupName, count } = req.params
    const { submitterUsername } = req.query

    try {
      const result = await createManuscripts({
        groupName,
        count: Number(count),
        submitterUsername,
      })

      res.status(200).json(result)
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: err.message })
    }
  })
}

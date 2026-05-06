// const { execSync } = require('child_process')
const path = require('path')
const { readFileSync } = require('fs')

const { logger } = require('@coko/server')

const { resetDbAndApplyDump } = require('../../../scripts/resetDb')
const { applyDump } = require('../../../scripts/resetDb')
const createToken = require('../../../scripts/cypress/createToken')
const seedForms = require('../../../scripts/cypress/seedForms')

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
}

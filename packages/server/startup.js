const { clientUrl, config, logger } = require('@coko/server')

const seedGroups = require('./scripts/seedGroups')
const { setConfig } = require('./controllers/config/configObject')
const { registerPlugins } = require('./services/plugins/plugins')
const { initiateJobSchedules } = require('./utils/jobUtils')
const yjsWebsocket = require('./services/yjsWebsocket/yjsWebsocket')

// Last line of defence for unhandled promise rejections in the app. Promise rejections should always be handled!
process.on('unhandledRejection', (reason, promise) => {
  logger.error('UNHANDLED REJECTION at:', promise, 'reason:', reason)
})

module.exports = [
  {
    label: 'Seed groups',
    execute: async () => {
      await seedGroups()
    },
  },
  {
    label: 'Set config',
    execute: async () => {
      setConfig({
        journal: config.get('journal'),
        teams: config.get('teams'),
        manuscripts: config.get('manuscripts'),
        clientUrl,
      }) // TODO pass all client config that does not come from `Config` table through this structure or append it to config resolver
    },
  },
  {
    label: 'Register plugins',
    execute: async () => {
      registerPlugins()
    },
  },
  {
    label: 'Initiate job schedules',
    execute: async () => {
      initiateJobSchedules() // Initiate all job schedules
    },
  },
  {
    label: 'Init yjs websocket',
    execute: () => {
      yjsWebsocket()
    },
  },
]

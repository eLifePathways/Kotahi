const { defineConfig } = require('cypress')

const serverUrl = process.env.SERVER_URL || 'http://localhost:3000'
const e2eApiUrl = `${serverUrl}/api/e2e`
const restoreUrl = `${e2eApiUrl}/restore`
const seedUrl = `${e2eApiUrl}/seed`
const createTokenUrl = `${e2eApiUrl}/createToken`
const seedFormsUrl = `${e2eApiUrl}/seedForms`

module.exports = defineConfig({
  viewportWidth: 1200,
  e2e: {
    baseUrl: 'http://localhost:4000',
  },
  screenshotOnRunFailure: false,
  video: false,
  allowCypressEnv: false,

  // custom config options
  restoreUrl,
  seedUrl,
  createTokenUrl,
  seedFormsUrl,
})

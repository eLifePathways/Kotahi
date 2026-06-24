const { logger } = require('@coko/server')

const { getXsweet } = require('../../../controllers/xsweet.controllers')

module.exports = {
  Query: {
    docxToHtml: async (_, { key }) => {
      let outHtml = ''
      let error = ''

      try {
        outHtml = await getXsweet(key)
      } catch (e) {
        error = e.message
        logger.error(e)
      }

      return {
        html: outHtml || '',
        error: error || '',
      }
    },
  },
}

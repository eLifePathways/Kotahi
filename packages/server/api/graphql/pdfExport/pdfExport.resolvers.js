const {
  htmlHandler,
  pdfHandler,
} = require('../../../controllers/pdfExport.controllers')

module.exports = {
  Query: {
    convertToPdf: async (_, { manuscriptId, useHtml }) => {
      const outUrl = await (useHtml
        ? htmlHandler(manuscriptId)
        : pdfHandler(manuscriptId))

      return { pdfUrl: outUrl || 'busted!' }
    },
  },
}

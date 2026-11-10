const {
  formatCitationFn,
  formatMultipleCitationsFn,
  getDataciteCslFromDOI,
  getFormattedReferences,
} = require('../../../controllers/reference/reference.controllers')

module.exports = {
  Query: {
    async getDataciteCslFromDOI(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getDataciteCslFromDOI(input, groupId)
    },

    async getFormattedReferences(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return getFormattedReferences(input, groupId)
    },

    async formatCitation(_, { citation }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return formatCitationFn(citation, groupId)
    },

    async formatMultipleCitations(_, { input }, ctx) {
      const groupId = ctx.req.headers['group-id']
      return formatMultipleCitationsFn(input, groupId)
    },
  },
}

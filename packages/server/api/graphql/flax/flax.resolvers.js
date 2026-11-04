const { rebuildCMSSite } = require('../../../controllers/flax.controllers')

module.exports = {
  Mutation: {
    rebuildFlaxSite: async (_, { params: paramsAsJson }, ctx) => {
      const params = paramsAsJson ? JSON.parse(paramsAsJson) : {}
      let status = ''
      let error = ''

      try {
        const groupId = ctx.req.headers['group-id']
        status = await rebuildCMSSite(groupId, params)
      } catch (e) {
        error = e
      }

      return {
        status: status ? status.message : '',
        error: error ? JSON.stringify(error) : '',
      }
    },
  },
}

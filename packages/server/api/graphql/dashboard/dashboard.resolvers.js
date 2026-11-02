const {
  getDashboardData,
} = require('../../../controllers/dashboard.controllers')

module.exports = {
  Query: {
    dashboardData: async (_, __, ctx) => {
      const groupId = ctx.req.headers['group-id']
      return getDashboardData(ctx.userId, groupId)
    },
  },
}

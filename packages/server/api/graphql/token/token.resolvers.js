const { generateToken } = require('../../../controllers/token.controllers')

module.exports = {
  Mutation: {
    async generateNewToken(_, { name, groupId }) {
      return generateToken(name, groupId)
    },
  },
}

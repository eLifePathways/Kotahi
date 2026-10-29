const {
  generateToken,
  hasToken,
} = require('../../../controllers/token.controllers')

module.exports = {
  Query: {
    async hasToken(_, { name, groupId }) {
      return hasToken(name, groupId)
    },
  },
  Mutation: {
    async generateNewToken(_, { name, groupId }) {
      return generateToken(name, groupId)
    },
  },
}

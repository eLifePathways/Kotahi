const { PublishedArtifact } = require('../../../models')

module.exports = {
  Query: {
    // REFACTOR: not used by client, maybe by flax?
    async publishedArtifacts(_, { manuscriptId }) {
      return (await PublishedArtifact.find({ manuscriptId })).result
    },
  },
}

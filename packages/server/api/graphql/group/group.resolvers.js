const Group = require('../../../models/group/group.model')

const {
  groupConfigs,
  oldConfig,
} = require('../../../controllers/group.controllers')

const group = async (_, { id }) => Group.findById(id)

const groups = async () => {
  const { result } = await Group.find({ isArchived: false })
  return result
}

const resolvers = {
  Query: {
    group,
    groups,
  },
  Group: {
    configs: groupConfigs,
    oldConfig,
  },
}

module.exports = resolvers

const { GraphQLError } = require('graphql')

const { Docmap, Group } = require('../models')

const docmap = async (externalId, groupName = null) => {
  const { result: groups } = await Group.find({ isArchived: false })
  let group = null
  if (groupName) group = groups.find(g => g.name === groupName)
  else if (groups.length === 1) [group] = groups
  if (!group) throw new Error(`Group with name '${groupName}' not found`)

  const record = await Docmap.findOne({
    externalId,
    groupId: group.id,
  })

  if (!record)
    throw new GraphQLError('Resource not found', {
      extensions: {
        code: 'BAD_USER_INPUT',
        argumentName: 'externalId',
      },
    })

  return JSON.stringify({
    ...JSON.parse(record.content),
    created: record.created,
    updated: record.updated,
  })
}

module.exports = { docmap }

const {
  parseCitationsCSL,
} = require('../../../controllers/anyStyle/anyStyle.controllers')

const buildCitationsCSL = async (_, { textReferences }, ctx) => {
  const groupId = ctx.req.headers['group-id']
  let outReferences = textReferences
  let error = ''

  try {
    outReferences = await parseCitationsCSL(textReferences, 0, groupId)
  } catch (e) {
    error = e.message
  }

  return {
    cslReferences: outReferences || '',
    error: error || '',
  }
}

const resolvers = {
  Query: {
    buildCitationsCSL,
  },
}

module.exports = resolvers

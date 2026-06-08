const {
  parseCitations,
  parseCitationsCSL,
} = require('../../../controllers/anyStyle/anyStyle.controllers')

const buildCitations = async (_, { textReferences }) => {
  let outReferences = textReferences
  let error = ''

  try {
    outReferences = await parseCitations(textReferences)
  } catch (e) {
    error = e
  }

  return {
    htmlReferences: outReferences || '',
    error: error ? JSON.stringify(error) : '',
  }
}

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
    buildCitations,
    buildCitationsCSL,
  },
}

module.exports = resolvers

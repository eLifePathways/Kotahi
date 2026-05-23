const User = require('./user.model')

const defaultIdentitiesLoader = async (userIds, options = {}) => {
  const { trx } = options

  const identities = await User.relatedQuery('defaultIdentity', trx).for(
    userIds,
  )

  const byUserId = new Map(identities.map(i => [i.userId, i]))
  return userIds.map(id => byUserId.get(id) ?? null)
}

module.exports = {
  defaultIdentitiesLoader,
}

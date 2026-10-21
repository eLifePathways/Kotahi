const User = require('./user.model')

const defaultIdentitiesLoader = async userIds => {
  const identities = await User.relatedQuery('defaultIdentity')
    .for(userIds)
    .joinRelated('user')
    .select('identities.*', 'user.email')

  const byUserId = new Map(identities.map(i => [i.userId, i]))
  return userIds.map(id => byUserId.get(id) ?? null)
}

module.exports = {
  defaultIdentitiesLoader,
}

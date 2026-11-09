const createToken = async username => {
  const User = require('../../models/user/user.model')

  const { createJWT } = require('@coko/server')

  const user = await User.findOne({ username })

  if (!user) {
    const { result: users } = await User.find({})
    throw new Error(
      `Could not find ${username} among users [${users
        .map(u => `'${u.username}'`)
        .join(', ')}]`,
    )
  }

  const jwt = createJWT(user)

  return jwt
}

module.exports = createToken

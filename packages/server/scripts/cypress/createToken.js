const createToken = async username => {
  const User = require('../../models/user/user.model')

  const { createJWT } = require('@coko/server')

  const user = await User.query().where({ username }).first()

  if (!user) {
    const users = await User.query().select('username')
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

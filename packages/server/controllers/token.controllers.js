const { uuid } = require('@coko/server')
const { Token } = require('../models')

const generateToken = async (name, groupId) => {
  const rawToken = uuid()
  const encodedValue = btoa(rawToken)

  const { value } = await Token.generateToken(name, encodedValue, groupId)

  return value
}

module.exports = {
  generateToken,
}

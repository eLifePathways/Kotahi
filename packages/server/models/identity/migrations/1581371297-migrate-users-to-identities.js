/* eslint-disable no-await-in-loop */
const { logger } = require('@coko/server')

const User = require('../../user/user.model')
const Identity = require('../identity.model')

exports.up = async () => {
  const users = await User.query().withGraphFetched('defaultIdentity')

  for (const user of users) {
    // To make the migration idempotent
    if (!user.defaultIdentity) {
      try {
        await Identity.query().insert({
          type: 'local',
          userId: user.id,
          isDefault: true,
        })
      } catch (e) {
        logger.error(e)
      }
    }
  }
}

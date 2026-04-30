const { useTransaction } = require('@coko/server')

const Channel = require('../channel.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      if (groups.length === 0) {
        const orphanedSystemwideChannelRecord = await Channel.query(
          trx,
        ).findOne({
          topic: 'System-wide discussion',
          type: 'editorial',
          groupId: null,
        })

        if (orphanedSystemwideChannelRecord) {
          await Channel.query().deleteById(orphanedSystemwideChannelRecord.id)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

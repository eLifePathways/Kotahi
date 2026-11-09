const { useTransaction } = require('@coko/server')

const Channel = require('../channel.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const { result: channels } = await Channel.find({}, { trx })
      const { result: groups } = await Group.find({}, { trx })

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && channels.length >= 1 && !channels[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Channel.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

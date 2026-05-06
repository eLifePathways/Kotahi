const { useTransaction } = require('@coko/server')

const Team = require('../team.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      if (groups.length === 0) {
        const orphanedGroupManagerRecord = await Team.query(trx).findOne({
          role: 'groupManager',
          global: true,
          objectId: null,
          objectType: null,
          type: 'team',
        })

        if (orphanedGroupManagerRecord) {
          await Team.query().deleteById(orphanedGroupManagerRecord.id)
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

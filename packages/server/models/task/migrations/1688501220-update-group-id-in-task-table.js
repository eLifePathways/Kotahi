const { useTransaction } = require('@coko/server')

const Task = require('../task.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const { result: tasks } = await Task.find({}, { trx })
      const { result: groups } = await Group.find({}, { trx })

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1 && tasks.length >= 1 && !tasks[0].group_id) {
        /* eslint no-param-reassign: "error" */
        await Task.query(trx)
          .patch({ groupId: groups[0].id })
          .where('groupId', null)
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

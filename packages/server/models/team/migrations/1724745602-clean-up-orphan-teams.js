const Team = require('../team.model')

exports.up = async () => {
  const orphanTeams = await Team.query()
    .whereNull('objectId')
    .andWhere(builder => {
      builder.whereNull('global').orWhere('global', false)
    })

  const ids = orphanTeams.map(t => t.id)

  await Team.deleteByIds(ids)
}

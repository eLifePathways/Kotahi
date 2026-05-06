const { useTransaction } = require('@coko/server')

const Team = require('../team.model')
const User = require('../../user/user.model')
const TeamMember = require('../../teamMember/teamMember.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const groups = await Group.query(trx)

      // Existing instances migrating to multi-tenancy groups
      if (groups.length >= 1) {
        const userTeamExists = await Team.query(trx).findOne({
          role: 'user',
          global: false,
          objectId: groups[0].id,
          objectType: 'Group',
        })

        if (!userTeamExists) {
          const userTeam = await Team.query(trx).insertAndFetch({
            name: 'User',
            role: 'user',
            global: false,
            objectId: groups[0].id,
            objectType: 'Group',
          })

          const users = await User.query(trx)

          await Promise.all(
            users.map(async user => {
              await TeamMember.query(trx).insert({
                userId: user.id,
                teamId: userTeam.id,
              })
            }),
          )
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

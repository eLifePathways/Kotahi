const { useTransaction } = require('@coko/server')

const TeamMember = require('../teamMember.model')

exports.up = async knex => {
  await knex.raw(
    `
      ALTER TABLE team_members ALTER COLUMN team_id SET NOT NULL;
      ALTER TABLE team_members ALTER COLUMN user_id SET NOT NULL;
      ALTER TABLE team_members ALTER COLUMN is_shared SET DEFAULT false;
    `,
  )

  const { result: members } = await TeamMember.find({})

  await useTransaction(async trx => {
    return Promise.all(
      members.map(async member => {
        if (member.isShared === null) {
          await TeamMember.patchById(member.id, { isShared: false }, { trx })
        }
      }),
    )
  })
}

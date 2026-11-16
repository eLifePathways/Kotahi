const { useTransaction } = require('@coko/server')

const Team = require('../team.model')

exports.up = async knex => {
  const hasName = await knex.schema.hasColumn('teams', 'name')
  const hasOwners = await knex.schema.hasColumn('teams', 'owners')
  const hasMembers = await knex.schema.hasColumn('teams', 'members')

  await knex.schema.table('teams', table => {
    if (hasName) table.renameColumn('name', 'display_name')
    if (hasOwners) table.dropColumn('owners')
    if (hasMembers) table.dropColumn('members')
  })

  const { result: teams } = await Team.find({})

  await useTransaction(async trx => {
    return Promise.all(
      teams.map(async t => {
        if (t.global === null) {
          await Team.query(trx).patchAndFetchById(t.id, {
            role: t.role,
            global: false,
          })
        }
      }),
    )
  })

  await knex.raw(
    `
      ALTER TABLE teams ALTER COLUMN display_name SET NOT NULL;
      ALTER TABLE teams ALTER COLUMN global SET DEFAULT false;
    `,
  )
}

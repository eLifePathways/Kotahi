const { useTransaction } = require('@coko/server')

const TeamMember = require('../teamMember.model')

exports.up = async db => {
  const data = await db.raw(`
    SELECT 
      team_id, 
      user_id, 
    COUNT(*) AS occurrences
    FROM 
      team_members
    GROUP BY 
      team_id, 
      user_id
    HAVING 
      COUNT(*) > 1;
  `)

  if (!data || !data.rows) return

  await useTransaction(async trx => {
    await Promise.all(
      data.rows.map(async row => {
        const dupes = await TeamMember.find(
          {
            teamId: row.team_id,
            userId: row.user_id,
          },
          { trx },
        )

        if (dupes.totalCount <= 1)
          throw new Error(
            'Query invalid: There should be more than one duplicate team members',
          )

        dupes.result.shift() // member to keep

        await Promise.all(
          dupes.result.map(async member => {
            await TeamMember.deleteById(member.id, { trx })
          }),
        )
      }),
    )
  })
}

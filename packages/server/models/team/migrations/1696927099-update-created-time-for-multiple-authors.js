const { useTransaction } = require('@coko/server')

const Team = require('../team.model')

exports.up = async () => {
  try {
    return useTransaction(async trx => {
      const authorTeams = await Team.query(trx)
        .where('role', 'author')
        .withGraphFetched('[manuscript, members]')

      for (const authorTeam of authorTeams) {
        const submitterId = authorTeam.manuscript?.submitterId

        for (const member of authorTeam.members) {
          // Check if the member's userId is not equal to the submitterId
          if (member.userId !== submitterId) {
            // increased the created date for invited author by 60 seconds
            const updatedDate = new Date(member.created.getTime() + 60000)

            // eslint-disable-next-line no-await-in-loop
            await member.$query(trx).patch({ created: updatedDate })
          }
        }
      }
    })
  } catch (error) {
    throw new Error(error)
  }
}

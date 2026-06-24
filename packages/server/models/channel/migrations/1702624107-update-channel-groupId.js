const Channel = require('../channel.model')

exports.up = async knex => {
  const channelsWithMissingGroup = await Channel.query(knex)
    .whereNull('groupId')
    .withGraphFetched('manuscript')

  if (channelsWithMissingGroup.length) {
    for (const channel of channelsWithMissingGroup) {
      if (channel.manuscriptId) {
        try {
          // eslint-disable-next-line no-await-in-loop
          await Channel.query(knex)
            .where('id', channel.id)
            .patch({ groupId: channel.manuscript.groupId })
        } catch (error) {
          throw new Error(
            `Error updating channel ${channel.id} for missing group: ${error.message}`,
          )
        }
      }
    }
  }
}

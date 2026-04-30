const { useTransaction } = require('@coko/server')

const NotificationUserOptions = require('../notificationUserOption.model')
const User = require('../../user/user.model')
const Group = require('../../group/group.model')

exports.up = async () => {
  await useTransaction(async trx => {
    const users = await User.query(trx)
    const groups = await Group.query(trx)

    if (users.length > 0 && groups.length > 0) {
      const path = ['chat']

      for (const user of users) {
        const option = user.eventNotificationsOptIn ? 'inherit' : 'off'

        for (const group of groups) {
          const notificationUserOptionData = {
            userId: user.id,
            path,
            option,
            groupId: group.id,
          }

          // eslint-disable-next-line no-await-in-loop
          await new NotificationUserOptions(notificationUserOptionData)
            .$query(trx)
            .insert()
        }
      }

      await trx.schema.alterTable(User.tableName, table => {
        table.dropColumn('eventNotificationsOptIn')
      })
    }
  })
}

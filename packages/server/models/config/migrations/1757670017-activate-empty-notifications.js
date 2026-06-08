const { useTransaction } = require('@coko/server')
const { Config, Notification } = require('../..')

exports.up = async () => {
  return useTransaction(async trx => {
    const configs = await Config.query(trx)

    if (configs.length > 0) {
      await Promise.all(
        configs.map(async config => {
          const { result: groupNotifications } = await Notification.find(
            { groupId: config.groupId },
            { trx },
          )

          const { eventsConfig } = config.formData?.notification || {}

          if (!eventsConfig) return

          const eventsToActivate = Object.keys(eventsConfig)
            .map(eventName => {
              const eventNotifications = groupNotifications.filter(
                g => g.event === eventName,
              )

              if (
                eventNotifications.length === 0 &&
                !eventsConfig[eventName].active
              ) {
                eventsConfig[eventName].active = true
                return eventName
              }

              return null
            })
            .filter(Boolean)

          if (eventsToActivate.length > 0) {
            config.formData.notification.eventsConfig = eventsConfig

            await config.$query(trx).patch({ formData: config.formData })
          }
        }),
      )
    }
  })
}

/**
 * Do nothing. This migration is a bug fix.
 * @returns bool
 */
exports.down = () => true

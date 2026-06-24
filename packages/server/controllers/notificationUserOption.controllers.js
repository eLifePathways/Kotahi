const { NotificationDigest, NotificationUserOption } = require('../models')

const notificationOption = async (userId, groupId, path) => {
  if (!userId) {
    throw new Error(
      'Cannot retrieve notificationOption for an unregistered user',
    )
  }

  const objectId = tryGetObjectIdFromPath(path)

  return NotificationUserOption.query().findOne({
    userId,
    path: `{${path.join(',')}}`,
    groupId,
    objectId,
  })
}

const reportUserIsActive = async (path, userId) => {
  if (path) {
    const pathString = path.join('/')

    await NotificationDigest.query().delete().where({
      userId,
      pathString,
      actioned: false,
    })
  }
}

const tryGetObjectIdFromPath = path => {
  if (!path.length) return null
  const lastNodeOfPath = path[path.length - 1]

  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      lastNodeOfPath,
    )
  ) {
    return lastNodeOfPath
  }

  return null
}

const updateNotificationOption = async (userId, groupId, path, option) => {
  if (!userId)
    throw new Error('Cannot updateNotificationOption for an unregistered user')

  if (!['off', 'inherit', '30MinSummary'].includes(option)) {
    throw new Error(
      `Unrecognized option '${option}' passed to updateNotificationOption`,
    )
  }

  const objectId = tryGetObjectIdFromPath(path)

  // Find the existing record based on userId, path, and groupId
  const existingOption = await NotificationUserOption.query()
    .where({ userId, groupId })
    .whereRaw('path = ?', `{${path.join(',')}}`)
    .first()

  if (existingOption) {
    return NotificationUserOption.query().patchAndFetchById(existingOption.id, {
      option,
    })
  }

  // If no existing record, create a new one

  return await NotificationUserOption.query().insert({
    userId,
    path,
    groupId,
    option,
    objectId,
  })
}

module.exports = {
  notificationOption,
  reportUserIsActive,
  updateNotificationOption,
}

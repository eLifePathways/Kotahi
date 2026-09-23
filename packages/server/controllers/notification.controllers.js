const { clientUrl, logger } = require('@coko/server')

const {
  Channel,
  Config,
  Group,
  Manuscript,
  Message,
  Notification,
  NotificationDigest,
  NotificationUserOption,
  User,
} = require('../models')

const { getUserRolesInManuscript } = require('./user.controllers')
const seekEvent = require('../services/notification.service')

const deleteActionedEntries = async (groupId, options = {}) => {
  const { trx } = options

  await NotificationDigest.query(trx)
    .delete()
    .where({ actioned: true, groupId })
}

const getGroupEvents = async groupId => {
  const config = await Config.query().findOne({ groupId })
  const { eventsConfig } = config.formData.notification

  const events = Object.keys(eventsConfig)
    .map(name => ({
      name,
      active: eventsConfig[name].active,
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  return events
}

const getEventNotifications = async (eventName, groupId) => {
  const { result: notifications } = await Notification.find({
    groupId,
    event: eventName,
  })

  return notifications
}

const getNotificationOptionForUser = async ({ userId, path, groupId }) => {
  if (!userId)
    throw new Error('Cannot get notification option for unregistered user')
  const lastPathSegment = path.length ? path[path.length - 1] : null

  // Get all records for this user in this group, that might relate to the current path,
  // skipping those set to 'inherit'.
  // A small number of non-relevant records may be included.
  const records = await NotificationUserOption.query()
    .where({ userId, groupId })
    .where(builder =>
      builder.where({ objectId: lastPathSegment }).orWhere({ objectId: null }),
    )
    .whereNot({ option: 'inherit' })

  // We're only interested in records whose paths are subpaths of the specified path
  const relevantRecords = records.filter(record => {
    if (record.path.length > path.length) return false

    for (let i = 0; i < record.path.length; i += 1) {
      if (record.path[i] !== path[i]) return false
    }

    return true
  })

  relevantRecords.sort((a, b) => b.path.length - a.path.length)
  const nearestAncestor = relevantRecords[0]

  return nearestAncestor?.option || '30MinSummary' // Fallback if no options are set
}

const notify = async (
  path,
  { context, time, users, groupId, currentUserId },
) => {
  if (!users) return

  // eslint-disable-next-line consistent-return
  const notificationPromises = users.map(async userId => {
    const option = await getNotificationOptionForUser({
      userId,
      path,
      groupId,
    })

    if (context.isMentioned && option === '30MinSummary') {
      // Immediate notification recipients
      return sendChatNotification({
        recipientId: userId,
        messageId: context.messageId,
        groupId,
        isMentioned: context.isMentioned,
        currentUserId,
      })
    }

    if (option === '30MinSummary') {
      const maxNotificationTime = new Date(time)
      maxNotificationTime.setMinutes(maxNotificationTime.getMinutes() + 30)

      return NotificationDigest.query().insert({
        time,
        maxNotificationTime,
        pathString: path.join('/'),
        option,
        context,
        userId,
        groupId,
      })
    }
  })

  await Promise.all(notificationPromises)
}

const sendChatNotification = async ({
  recipientId,
  messageId,
  groupId,
  currentUserId = null,
  isMentioned = false,
}) => {
  const recipient = await User.findById(recipientId)
  const message = await Message.findById(messageId)
  const channel = await Channel.findById(message.channelId)
  if (channel.groupId !== groupId)
    throw new Error(
      `Attempt by group ${groupId} to send chat notification for group ${channel.groupId}`,
    )
  const group = await Group.findById(groupId)

  // send email notification
  const appUrl = `${clientUrl}/${group.name}`
  let authorName = ''
  let discussionUrl = appUrl
  let manuscript = null
  let discussionBasedTrigger = ''

  if (!channel.manuscriptId) {
    discussionUrl += `/admin/manuscripts` // admin discussion
  } else {
    discussionUrl += `/versions/${channel.manuscriptId}`

    const roles = await getUserRolesInManuscript(
      recipient.id,
      channel.manuscriptId,
    )

    if (roles.groupManager || roles.anyEditor) {
      discussionUrl += '/decision'

      if (channel.type === 'editorial') {
        discussionBasedTrigger = 'editorialDiscussion'
        discussionUrl += '?discussion=editorial'
      }
    } else if (roles.reviewer) {
      discussionUrl += '/review'
    } else if (roles.author) {
      discussionUrl += '/submit'
    } else {
      discussionUrl = `${appUrl}/dashboard`
    }

    manuscript = await Manuscript.findById(channel.manuscriptId)
    const author = await manuscript.getManuscriptAuthor()
    authorName = author ? author.username : ''
  }

  let currentUser

  if (currentUserId) {
    currentUser = await User.findById(currentUserId, { throwIfNotFound: false })
  }

  const { id: channelId } = channel
  const triggerParam = isMentioned ? 'mention' : 'unread'

  const data = {
    manuscript,
    recipientName: recipient.username,
    discussionUrl,
    senderName: currentUser?.username || '',
    authorName,
    context: { messageId, channelId, recipient },
    groupId,
  }

  seekEvent(`chat-${triggerParam}`, data)
  seekEvent(`chat-${discussionBasedTrigger}`, data)
}

const sendNotifications = async groupId => {
  // The following query results first row for every user and path string combination
  // in the notification digest, where max notification time is in the past.
  const notificationDigestRows = await NotificationDigest.query()
    .distinctOn(['user_id', 'path_string'])
    .where('max_notification_time', '<', new Date())
    .where({ groupId })
    .orderBy(['user_id', 'path_string', 'max_notification_time'])

  let notificationCount = 0

  await Promise.all(
    notificationDigestRows.map(async notificationDigest => {
      if (notificationDigest.actioned) return

      await sendChatNotification({
        recipientId: notificationDigest.userId,
        messageId: notificationDigest.context.messageId,
        groupId,
      })

      notificationCount += 1

      // query to update all notificationdigest entries where user=user and path=path
      await NotificationDigest.query()
        .update({
          actioned: true,
        })
        .where({
          userId: notificationDigest.userId,
          pathString: notificationDigest.pathString,
          groupId,
        })
    }),
  )

  if (notificationCount > 0) {
    logger.info(
      `Sent ${notificationCount} event notification${
        notificationCount === 1 ? '' : 's'
      } for group ${groupId}`,
    )
  }
}

const setNotificationActive = async notificationId => {
  const notification = await Notification.findById(notificationId)
  const { active, recipient, emailTemplateId, subject } = notification
  const allowActivate = recipient && emailTemplateId && subject

  return !allowActivate
    ? notification
    : Notification.patchAndFetchById(notificationId, { active: !active })
}

const setEventActive = async (name, groupId) => {
  const config = await Config.query().findOne({ groupId })
  const formData = config.formData || {}
  const notification = { ...formData.notification }

  notification.eventsConfig[name].active =
    !notification.eventsConfig[name].active
  formData.notification = notification

  await Config.query()
    .findOne({ groupId })
    .patch({
      formData: JSON.stringify(formData),
    })

  return notification.eventsConfig[name].active
}

module.exports = {
  deleteActionedEntries,
  getEventNotifications,
  getGroupEvents,
  notify,
  sendNotifications,
  setNotificationActive,
  setEventActive,
}

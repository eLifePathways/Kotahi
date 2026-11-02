import UserNotification from '../models/userNotification/userNotification.model'

export const getUserNotifications = async (
  userId: string,
  groupId: string,
  limit: number,
): Promise<{ notifications: UserNotification[]; totalCount: number }> => {
  const { results, total } = await UserNotification.findForUser(
    userId,
    groupId,
    limit,
  )

  return { notifications: results, totalCount: total }
}

export const dismissUserNotification = async (id: string): Promise<number> => {
  return UserNotification.dismissById(id)
}

export const dismissAllUserNotifications = async (
  userId: string,
  groupId: string,
): Promise<number> => {
  return UserNotification.dismissAllForUser(userId, groupId)
}

const USER_NOTIFICATION_RETENTION_DAYS = 90

export const deleteExpiredUserNotifications = async (): Promise<number> => {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - USER_NOTIFICATION_RETENTION_DAYS)
  return UserNotification.deleteOlderThan(cutoff)
}

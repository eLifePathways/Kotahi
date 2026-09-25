import UserNotification from '../models/userNotification/userNotification.model'

export const getUserNotifications = async (
  userId: string,
  groupId: string,
): Promise<UserNotification[]> => {
  return UserNotification.findForUser(userId, groupId)
}

export const dismissUserNotification = async (id: string): Promise<number> => {
  return UserNotification.dismissById(id)
}

const {
  createTaskEmailNotificationLog,
  deleteTaskNotification,
  getTasks,
  taskAssignee,
  taskEmailNotification,
  taskEmailNotificationRecipientUser,
  taskNotificationLogs,
  updateTask,
  updateTaskNotification,
  updateTasks,
  updateTaskStatus,
  userHasTaskAlerts,
} = require('../../../controllers/task.controllers')

module.exports = {
  Query: {
    tasks: async (_, { manuscriptId, groupId }) => {
      return getTasks(manuscriptId, groupId)
    },

    userHasTaskAlerts: async (_, __, ctx) => {
      return userHasTaskAlerts(ctx.userId)
    },
  },

  Mutation: {
    createTaskEmailNotificationLog: async (_, { taskEmailNotificationLog }) => {
      return createTaskEmailNotificationLog(taskEmailNotificationLog)
    },

    deleteTaskNotification: async (_, { id }) => {
      return deleteTaskNotification(id)
    },

    updateTask: async (_, { task }) => {
      return updateTask(task)
    },

    updateTaskNotification: async (_, { taskNotification }) => {
      return updateTaskNotification(taskNotification)
    },

    updateTasks: async (_, { manuscriptId, groupId, tasks }) => {
      return updateTasks(manuscriptId, groupId, tasks)
    },

    updateTaskStatus: async (_, { task }) => {
      return updateTaskStatus(task)
    },
  },

  Task: {
    assignee: async parent => {
      return taskAssignee(parent)
    },

    emailNotifications: async parent => {
      return taskEmailNotification(parent)
    },

    notificationLogs: async parent => {
      return taskNotificationLogs(parent)
    },
  },

  TaskEmailNotification: {
    recipientUser: async parent => {
      return taskEmailNotificationRecipientUser(parent)
    },
  },
}

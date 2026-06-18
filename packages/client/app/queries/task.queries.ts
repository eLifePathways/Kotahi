import { gql } from '@apollo/client'

const taskFields = `
id
created
updated
manuscriptId
groupId
description
title
assigneeUserId
assignee {
  id
  username
  email
  profilePicture
}
defaultDurationDays
dueDate
reminderPeriodDays
sequenceIndex
status
emailNotifications {
  id
  taskId
  recipientUserId
  recipientType
  notificationElapsedDays
  emailTemplateId
  recipientName
  recipientEmail
  recipientUser {
    id
    username
    email
  }
  sentAt
}
notificationLogs {
  id
  taskId
  senderEmail
  recipientEmail
  emailTemplateId
  content
  updated
  created
}
assigneeType
assigneeName
assigneeEmail

`

export const UPDATE_TASKS = gql`
  mutation UpdateTasks($manuscriptId: ID, $groupId: ID!, $tasks: [TaskInput!]!) {
    updateTasks(manuscriptId: $manuscriptId, groupId: $groupId, tasks: $tasks) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK = gql`
  mutation UpdateTask($task: TaskInput!) {
    updateTask(task: $task) {
      ${taskFields}
    }
  }
`

export const UPDATE_TASK_NOTIFICATION = gql`
  mutation UpdateTaskNotification ($taskNotification: TaskEmailNotificationInput!) {
    updateTaskNotification(taskNotification: $taskNotification) {
      ${taskFields}
    }
  }
`
export const DELETE_TASK_NOTIFICATION = gql`
  mutation DeleteTaskNotification($id: ID!) {
    deleteTaskNotification(id: $id)
    {
      ${taskFields}
    }
  }
`
export const UPDATE_TASK_STATUS = gql`
  mutation UpdateTaskStatus($task: UpdateTaskStatusInput!) {
    updateTaskStatus(task: $task) {
      ${taskFields}
    }
  }
`

export const CREATE_TASK_EMAIL_NOTIFICATION_LOGS = gql`
  mutation CreateTaskEmailNotificationLog($taskEmailNotificationLog: TaskEmailNotificationLogInput!) {
    createTaskEmailNotificationLog(taskEmailNotificationLog: $taskEmailNotificationLog) {
      ${taskFields}
    }
  }
`

export const GET_TASKS = gql`
  query GetTasksQuery($groupId: ID!) {
    tasks(manuscriptId: null, groupId: $groupId) {
      id
      created
      updated
      manuscriptId
      groupId
      title
      assigneeUserId
      description
      assignee {
        id
        username
        email
        profilePicture
      }
      emailNotifications {
        id
        taskId
        recipientUserId
        recipientType
        notificationElapsedDays
        emailTemplateId
        recipientName
        recipientEmail
        recipientUser {
          id
          username
          email
        }
      }
      notificationLogs {
        id
        taskId
        senderEmail
        recipientEmail
        emailTemplateId
        content
        updated
        created
      }
      assigneeType
      assigneeEmail
      assigneeName
      defaultDurationDays
      dueDate
      reminderPeriodDays
      status
    }

    users {
      id
      username
      email
      profilePicture
    }

    emailTemplates {
      id
      created
      updated
      emailTemplateType
      emailContent {
        cc
        subject
        body
        description
      }
    }
  }
`

export const REMOVE_TASK_ALERTS_FOR_CURRENT_USER = gql`
  mutation RemoveTaskAlertsForCurrentUser {
    removeTaskAlertsForCurrentUser
  }
`

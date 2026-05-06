import { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { gql } from '@apollo/client'
import {
  DELETE_TASK_NOTIFICATION,
  UPDATE_TASK,
  UPDATE_TASKS,
  UPDATE_TASK_NOTIFICATION,
} from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import TasksTemplate from './TasksTemplate'
import { roles } from '../../../globals'
import { ConfigContext } from '../../config/src'

const query = gql`
  query getTasksQuery($groupId: ID!) {
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

const TasksTemplatePage = () => {
  const config = useContext(ConfigContext)

  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [{ query, variables: { groupId: config.groupId } }],
  })

  const [updateTaskNotification] = useMutation(UPDATE_TASK_NOTIFICATION, {
    refetchQueries: [{ query, variables: { groupId: config.groupId } }],
  })

  const [deleteTaskNotification] = useMutation(DELETE_TASK_NOTIFICATION, {
    refetchQueries: [{ query, variables: { groupId: config.groupId } }],
  })

  const [updateTasks] = useMutation(UPDATE_TASKS, {
    refetchQueries: [{ query, variables: { groupId: config.groupId } }],
  })

  const { loading, error, data } = useQuery(query, {
    variables: { groupId: config.groupId },
  })

  if (loading && !data) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <TasksTemplate
      deleteTaskNotification={deleteTaskNotification}
      emailTemplates={data.emailTemplates}
      roles={roles}
      tasks={data.tasks}
      updateTask={updateTask}
      updateTaskNotification={updateTaskNotification}
      updateTasks={updateTasks}
      users={data.users}
    />
  )
}

export default TasksTemplatePage

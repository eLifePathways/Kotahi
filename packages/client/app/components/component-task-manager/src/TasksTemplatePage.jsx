import { useContext } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import {
  DELETE_TASK_NOTIFICATION,
  UPDATE_TASK,
  UPDATE_TASKS,
  UPDATE_TASK_NOTIFICATION,
  GET_TASKS,
} from '../../../queries'
import { CommsErrorBanner, Spinner } from '../../shared'
import TasksTemplate from './TasksTemplate'
import { roles } from '../../../globals'
import { ConfigContext } from '../../config/src'

const TasksTemplatePage = () => {
  const config = useContext(ConfigContext)

  const [updateTask] = useMutation(UPDATE_TASK, {
    refetchQueries: [
      { query: GET_TASKS, variables: { groupId: config.groupId } },
    ],
  })

  const [updateTaskNotification] = useMutation(UPDATE_TASK_NOTIFICATION, {
    refetchQueries: [
      { query: GET_TASKS, variables: { groupId: config.groupId } },
    ],
  })

  const [deleteTaskNotification] = useMutation(DELETE_TASK_NOTIFICATION, {
    refetchQueries: [
      { query: GET_TASKS, variables: { groupId: config.groupId } },
    ],
  })

  const [updateTasks] = useMutation(UPDATE_TASKS, {
    refetchQueries: [
      { query: GET_TASKS, variables: { groupId: config.groupId } },
    ],
  })

  const { loading, error, data } = useQuery(GET_TASKS, {
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

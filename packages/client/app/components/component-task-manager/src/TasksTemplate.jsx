/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import TaskList from './TaskList'
import { SectionContent } from '../../shared'
import Page from '../../../ui/shared/Page'

const TaskListContainer = styled.div`
  padding: 18px 8px;
`

const TasksTemplate = ({
  tasks,
  users,
  updateTask,
  updateTasks,
  roles,
  updateTaskNotification,
  deleteTaskNotification,
  emailTemplates,
}) => {
  const { t } = useTranslation()
  return (
    <Page title={t('tasksPage.Task Template Builder')}>
      <SectionContent>
        <TaskListContainer>
          <TaskList
            deleteTaskNotification={deleteTaskNotification}
            editAsTemplate
            emailTemplates={emailTemplates}
            manuscriptId={null}
            roles={roles}
            tasks={tasks}
            updateTask={updateTask}
            updateTaskNotification={updateTaskNotification}
            updateTasks={updateTasks}
            users={users}
          />
        </TaskListContainer>
      </SectionContent>
    </Page>
  )
}

export default TasksTemplate

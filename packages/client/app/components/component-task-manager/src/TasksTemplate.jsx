/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import TaskList from './TaskList'
import { Container, Heading, SectionContent, WidthLimiter } from '../../shared'

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
    <Container>
      <Heading>{t('tasksPage.Task Template Builder')}</Heading>
      <WidthLimiter>
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
      </WidthLimiter>
    </Container>
  )
}

export default TasksTemplate

/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/use-memo */
/* eslint-disable react/prop-types */
/* eslint-disable jsx-a11y/no-autofocus */

import { useCallback, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { grid } from '@coko/client'
import { ActionButton, TextInput } from '../../shared'
import FormWaxEditor from '../../component-formbuilder/src/components/FormWaxEditor'
import TaskNotificationDetails from './TaskNotificationDetails'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import Modal from '../../component-modal/src/Modal'
import SecondaryActionButton from '../../shared/SecondaryActionButton'
import CounterField from '../../shared/CounterField'
import theme, { color } from '../../../theme'
import { convertTimestampToDateString } from '../../../shared/dateUtils'

const TitleCell = styled.div`
  align-items: center;
  background: transparent;
  display: flex;
  height: 45px;
  line-height: 1em;
`

const DurationDaysCell = styled.div`
  align-items: center;
  display: flex;
  height: 45px;
  justify-content: flex-start;
  position: relative;
`

const TaskPrimaryFieldsContainer = styled.div`
  display: flex;
`

const TaskRecipientsContainer = styled.div`
  margin-bottom: 20px;
`

const TaskSectionContainer = styled.div`
  margin-bottom: ${grid(4)};

  &:first-child {
    padding-top: 0;
  }

  &:last-child {
    padding-bottom: 0;
    padding-top: 0;
  }
`

const TaskTitle = styled.div`
  color: ${color.gray20};
  font-family: ${theme.fontInterface};
  font-size: ${theme.fontSizeBase};
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 19px;
  margin-bottom: 4px;
`

const BaseFieldContainer = styled.div`
  display: flex;
  flex-direction: column;

  & + div {
    margin-left: 20px;
  }
`

const TitleFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 34em;
`

const AssigneeFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 290px;
`

const DescriptionFieldContainer = styled(BaseFieldContainer)`
  margin-top: ${grid(5)};

  & .wax-surface-scroll {
    height: 100px;
  }
`

const DueDateFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 7.8em;
`

const TaskNotificationLogsContainer = styled.div`
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
`

const NotificationLogsToggle = styled.button`
  background-color: transparent;
  border: none;
  color: ${color.brand1.base};
  font-size: ${theme.fontSizeBaseSmall};
  padding: 20px 10px;
  text-decoration: underline;
`

const NotificationLogs = styled.div`
  color: ${color.brand1.base};
  font-size: ${theme.fontSizeBaseSmall};
  margin: 10px 0;
  text-align: left;
`

const TaskActionContainer = styled.div`
  display: flex;
  justify-content: space-between;
`

const TaskEditModal = ({
  task,
  updateTask,
  updateTaskNotification: persistTaskNotification,
  assigneeGroupedOptions,
  // isReadOnly,
  editAsTemplate,
  dueDateLocalString,
  transposedEndOfToday,
  transposedDueDate,
  recipientGroupedOptions,
  deleteTaskNotification,
  displayDefaultDurationDays,
  createTaskEmailNotificationLog,
  notificationOptions,
  manuscript,
  currentUser,
  sendNotifyEmail,
  isOpen,
  onSave,
  onCancel,
  emailTemplates,
  addReviewer,
}) => {
  const { t } = useTranslation()

  const [taskEmailNotifications, setTaskNotifications] = useState(
    task.emailNotifications ?? [],
  )

  const [selectedDurationDays, setSelectedDurationDays] = useState(
    task.defaultDurationDays,
  )

  const [taskTitle, setTaskTitle] = useState(task?.title || '')

  const [taskDescription, setTaskDescription] = useState(
    task?.description || '',
  )

  useEffect(() => {
    setTaskTitle(task.title)
  }, [task])

  useEffect(() => {
    setTaskNotifications(task.emailNotifications ?? [])
  }, [isOpen, task])

  useEffect(() => {
    setTaskDescription(task.description)
  }, [task])

  const updateTaskDescriptionDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  const updateTaskTitleDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  useEffect(() => updateTaskTitleDebounce.flush, [])
  useEffect(() => updateTaskDescriptionDebounce.flush, [])

  const repackageTaskNotification = taskNotification => ({
    id: taskNotification.id,
    taskId: taskNotification.taskId,
    recipientUserId: taskNotification.recipientUserId || null,
    recipientType: taskNotification.recipientType || null,
    notificationElapsedDays: taskNotification.notificationElapsedDays || null,
    emailTemplateId: taskNotification.emailTemplateId || null,
    recipientName: taskNotification.recipientName || null,
    recipientEmail: taskNotification.recipientEmail || null,
  })

  const updateTaskTitle = value => {
    setTaskTitle(value)
    updateTaskTitleDebounce(task.id, { ...task, title: value })
  }

  const updateTaskDescription = value => {
    setTaskDescription(value)
    updateTaskDescriptionDebounce(task.id, { ...task, description: value })
  }

  const updateTaskNotification = async updatedTaskNotification => {
    if (
      updatedTaskNotification.recipientType ||
      updatedTaskNotification.emailTemplateId
    ) {
      persistTaskNotification({
        variables: {
          taskNotification: repackageTaskNotification({
            ...updatedTaskNotification,
          }),
        },
      })
    } else if (
      (task.emailNotifications ?? []).some(
        emailNotification =>
          emailNotification.id === updatedTaskNotification.id,
      )
    ) {
      // if updatedTaskNotification is in task.emailNotifications then it's
      // an existing task without valid recipient and email template and
      // it needs to be deleted. Else, it's a new task without valid
      // recipient and email template so no deletion required
      deleteTaskNotification({
        variables: { id: updatedTaskNotification.id },
      })
    }

    setTaskNotifications(currentTaskEmailNotifications =>
      currentTaskEmailNotifications.map(tN =>
        tN.id === updatedTaskNotification.id ? updatedTaskNotification : tN,
      ),
    )
  }

  const addNewTaskNotification = () => {
    setTaskNotifications([
      ...(taskEmailNotifications ?? []),
      {
        id: uuid(),
        taskId: task.id,
        recipientType: null,
      },
    ])
  }

  const handleDeleteTaskNotification = taskNotificationId => {
    const updatedTaskNotifications = taskEmailNotifications.filter(
      notification => notification.id !== taskNotificationId,
    )

    setTaskNotifications(updatedTaskNotifications)
    deleteTaskNotification({
      variables: { id: taskNotificationId },
    })
  }

  const [isToggled, setToggled] = useState(false)

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  return (
    <Modal
      contentStyles={{
        margin: 'auto',
        maxWidth: '1200px',
        minHeight: '480px',
        overflow: 'hidden',
        width: '90vw',
      }}
      isOpen={isOpen}
      onClose={() => onCancel(false)}
      rightActions={
        <ActionButton onClick={() => onSave(false)} primary>
          {t('common.Save')}
        </ActionButton>
      }
      title={t('modals.taskEdit.Task details')}
    >
      <TaskSectionContainer>
        <TaskPrimaryFieldsContainer>
          <TitleFieldContainer>
            <TaskTitle>{t('modals.taskEdit.Task title')}</TaskTitle>
            <TitleCell>
              <TextInput
                autoFocus={!taskTitle}
                onChange={event => updateTaskTitle(event.target.value)}
                placeholder={t('modals.taskEdit.Give your task a name')}
                title={taskTitle}
                value={taskTitle}
              />
            </TitleCell>
          </TitleFieldContainer>
          <AssigneeFieldContainer>
            <TaskTitle>{t('modals.taskEdit.Assignee')}</TaskTitle>
            <AssigneeDropdown
              assigneeGroupedOptions={assigneeGroupedOptions}
              task={task}
              unregisteredFieldsAlign="row"
              updateTask={updateTask}
            />
          </AssigneeFieldContainer>
          {!editAsTemplate && task && task.status !== status.NOT_STARTED ? (
            <DueDateFieldContainer>
              <TaskTitle>{t('modals.taskEdit.Due date')}</TaskTitle>
              <DueDateField
                displayDefaultDurationDays={displayDefaultDurationDays}
                dueDateLocalString={dueDateLocalString}
                position="bottom center"
                task={task}
                transposedDueDate={transposedDueDate}
                transposedEndOfToday={transposedEndOfToday}
                updateTask={updateTask}
              />
            </DueDateFieldContainer>
          ) : (
            <div>
              <TaskTitle>{t('modals.taskEdit.Duration in days')}</TaskTitle>
              <DurationDaysCell>
                <CounterField
                  minValue={0}
                  onChange={val => {
                    setSelectedDurationDays(val)
                    updateTask(task.id, {
                      ...task,
                      defaultDurationDays: val,
                    })
                  }}
                  showNone
                  value={task.defaultDurationDays}
                />
              </DurationDaysCell>
            </div>
          )}
        </TaskPrimaryFieldsContainer>
        <DescriptionFieldContainer>
          <TaskTitle>{t('modals.taskEdit.Task description')}</TaskTitle>
          <FormWaxEditor
            onChange={value => updateTaskDescription(value)}
            value={taskDescription}
          />
        </DescriptionFieldContainer>
      </TaskSectionContainer>
      <TaskSectionContainer>
        <TaskRecipientsContainer>
          {taskEmailNotifications?.length ? (
            <>
              {taskEmailNotifications.map(notification => (
                <TaskNotificationDetails
                  addReviewer={addReviewer}
                  createTaskEmailNotificationLog={
                    createTaskEmailNotificationLog
                  }
                  currentUser={currentUser}
                  deleteTaskNotification={handleDeleteTaskNotification}
                  editAsTemplate={editAsTemplate}
                  emailTemplates={emailTemplates}
                  key={notification.id}
                  manuscript={manuscript}
                  notificationOptions={notificationOptions}
                  recipientGroupedOptions={recipientGroupedOptions}
                  selectedDurationDays={selectedDurationDays}
                  sendNotifyEmail={sendNotifyEmail}
                  task={task}
                  taskEmailNotification={notification}
                  updateTaskNotification={updateTaskNotification}
                />
              ))}
            </>
          ) : null}
        </TaskRecipientsContainer>
        <TaskActionContainer>
          <SecondaryActionButton
            disabled={
              !editAsTemplate && taskEmailNotifications?.length
                ? taskEmailNotifications.some(
                    tN => !tN.recipientType && !tN.emailTemplateId,
                  )
                : false
            }
            onClick={addNewTaskNotification}
            primary
          >
            {t('modals.taskEdit.Add Notification Recipient')}
          </SecondaryActionButton>
        </TaskActionContainer>
        {!editAsTemplate
          ? task.notificationLogs &&
            task.notificationLogs.length !== 0 && (
              <TaskNotificationLogsContainer>
                <NotificationLogsToggle onClick={() => setToggled(!isToggled)}>
                  {isToggled
                    ? t('modals.taskEdit.Hide all notifications sent', {
                        count: task.notificationLogs?.length,
                      })
                    : t('modals.taskEdit.Show all notifications sent', {
                        count: task.notificationLogs?.length,
                      })}
                </NotificationLogsToggle>
                {isToggled && (
                  <NotificationLogs>
                    {task.notificationLogs.map(log => (
                      <>
                        <div>{convertTimestampToDateString(log.created)}</div>
                        <div>{log.content}</div>
                        <br />
                      </>
                    ))}
                  </NotificationLogs>
                )}
              </TaskNotificationLogsContainer>
            )
          : null}
      </TaskSectionContainer>
    </Modal>
  )
}

TaskEditModal.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    assignee: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
    }),
    dueDate: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.shape({}),
    ]),
    status: PropTypes.string.isRequired,
  }).isRequired,
  /** Callback for when a new task is abandoned before receiving a title (e.g. escape was pressed) */
  onCancel: PropTypes.func,
  updateTask: PropTypes.func.isRequired,
}
TaskEditModal.defaultProps = {
  onCancel: () => {},
}

export default TaskEditModal

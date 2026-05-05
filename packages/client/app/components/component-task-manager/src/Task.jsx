/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/purity, react-hooks/use-memo */
/* eslint-disable react/prop-types */

/* stylelint-disable color-function-notation, alpha-value-notation */

import { useState, useEffect, useContext, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment-timezone'
import styled, { css } from 'styled-components'
import { Draggable } from 'react-beautiful-dnd'
import { Circle, CheckCircle, MoreVertical } from 'react-feather'
import { th, grid } from '@coko/client'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { transposeFromTimezoneToLocal } from '../../../shared/dateUtils'
import {
  MinimalButton,
  ActionButton,
  LooseColumn,
  MediumRow,
  TextInput,
} from '../../shared'

import { DragVerticalIcon } from '../../shared/Icons'
import Modal from '../../component-modal/src/ConfirmationModal'
import { ConfigContext } from '../../config/src'
import AssigneeDropdown from './AssigneeDropdown'
import DueDateField from './DueDateField'
import StatusDropdown from './StatusDropdown'
import TaskEditModal from './TaskEditModal'
import CounterField from '../../shared/CounterField'
import { color } from '../../../theme'

const TaskRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${grid('1')};

  &:hover > div:first-child > div:first-child > svg,
  &:hover > div:first-child > button:last-child > svg {
    display: block;
  }
`

const TaskRowContainer = styled.div`
  padding: 10px 8px 15px;

  & + div {
    border-top: 2px solid rgb(191 191 191 / 50%);
  }
`

const TitleCell = styled.div`
  display: flex;

  input {
    margin-left: 7px;
  }
`

const StatusActionCell = styled.div`
  /* stylelint-disable-next-line declaration-no-important */
  background: none !important;
  border-right: ${grid(1)} solid transparent;
  flex: 0 1 12em;
  justify-content: flex-start;

  ${props =>
    props.isOverdue
      ? css`
          border-right-color: ${th('colorError')};
        `
      : ''}

  padding-right: ${grid(1)};
`

const DurationDaysCell = styled.div`
  align-items: center;
  display: flex;
  height: 45px;
  justify-content: flex-start;
  line-height: 1.5;
  position: relative;
`

const Handle = styled.div`
  align-items: center;
  display: flex;
  flex: 0 0 ${grid(3)};
  height: ${grid(5)};
  justify-content: center;
  width: ${grid(3)};
`

const DragIcon = styled(DragVerticalIcon)`
  height: 20px;
  stroke: ${color.gray40};
  stroke-width: 1.8;
  width: 20px;

  &:hover {
    stroke: ${color.brand1.base};
  }
`

const Ellipsis = styled(MoreVertical)`
  cursor: pointer;
  height: 20px;
  width: 20px;

  &:hover path {
    fill: ${color.brand1.base};
  }
`

const ModalContainer = styled(LooseColumn)`
  background-color: ${color.backgroundA};
  padding: ${grid(2.5)} ${grid(3)};
  z-index: 10000;
`

const ActionDialog = styled.div`
  background: ${color.backgroundA};
  border-radius: 6px;
  box-shadow: 0 0 8px rgb(0 0 0 / 25%);
  left: -80px;
  position: absolute;
  top: 15px;
  z-index: 9999;
`

const BaseLabel = styled.div`
  cursor: pointer;
  padding: 12px 20px;

  &:first-child {
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
  }

  &:last-child {
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  &:hover,
  &:focus {
    background-color: ${color.gray95};
  }
`

const EditLabel = styled(BaseLabel)``
const DeleteLabel = styled(BaseLabel)``

const TaskAction = styled.div`
  cursor: pointer;
  display: flex;
  position: relative;
`

const BaseFieldContainer = styled.div`
  /* align-items: flex-start; */
  background: transparent;
  display: flex;
  flex-direction: column;
  line-height: 1em;
`

const TitleFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 40em;
`

const AssigneeFieldContainer = styled(BaseFieldContainer)`
  flex: 1 1 15em;
`

const DurationDaysFieldContainer = styled(BaseFieldContainer)`
  flex: 0 0 10em;
  margin-left: 10px;
`

const DueDateFieldContainer = styled(BaseFieldContainer)`
  align-items: flex-end;
  flex: 0 0 18em;
  flex-direction: row;

  > div {
    flex: 1;
  }

  > div + div {
    margin-left: ${grid(1)};
  }
`

const calculateDaysDifference = (a, b) => {
  const aMidnight = new Date(a)
  aMidnight.setHours(0)
  aMidnight.setMinutes(0)
  aMidnight.setSeconds(0)
  const bMidnight = new Date(b)
  bMidnight.setHours(0)
  bMidnight.setMinutes(0)
  bMidnight.setSeconds(0)
  return Math.round((bMidnight - aMidnight) / (24 * 60 * 60 * 1000))
}

const getLocalTimeString = val => {
  const date = new Date(val)
  const tzOffset = -date.getTimezoneOffset() // getTimezoneOffset gives an inverted value (a POSIX compliance thing)
  const sign = tzOffset >= 0 ? '+' : '-'
  const tzOffsetWholeHours = Math.abs(Math.trunc(tzOffset / 60))
  const tzOffsetMinutes = Math.abs(tzOffset % 60)

  const tzString =
    tzOffset === 0
      ? 'GMT'
      : `GMT${sign}${tzOffsetWholeHours}${
          tzOffsetMinutes ? `:${tzOffsetMinutes}` : ''
        }`

  return `${moment(date).format('YYYY-MM-DD HH:mm')} local time (${tzString})`
}

const Task = ({
  task: propTask,
  index,
  updateTask,
  assigneeGroupedOptions,
  // onCancel,
  onDelete,
  isReadOnly,
  editAsTemplate,
  recipientGroupedOptions,
  updateTaskNotification,
  deleteTaskNotification,
  currentUser,
  manuscript,
  sendNotifyEmail,
  createTaskEmailNotificationLog,
  emailTemplates,
  addReviewer,
}) => {
  const config = useContext(ConfigContext)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const [isEditTaskMetaModal, setIsEditTaskMetaModal] = useState(false)
  const [isActionDialog, setIsActionDialog] = useState(false)

  const taskRef = useRef()

  const [task, setTask] = useState(propTask)
  const { t } = useTranslation()

  useEffect(() => {
    setTask(propTask)
  }, [propTask])

  const [taskTitle, setTaskTitle] = useState(task?.title || '')

  useEffect(() => {
    setTaskTitle(task.title)
  }, [task])

  const updateTaskTitleDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  useEffect(() => {
    return updateTaskTitleDebounce.flush
  }, [])

  const updateTaskTitle = value => {
    setTaskTitle(value)
    updateTaskTitleDebounce(task.id, { ...task, title: value })
  }

  const [transposedDueDate, setTransposedDueDate] = useState(
    transposeFromTimezoneToLocal(
      task.dueDate,
      config?.taskManager?.teamTimezone,
    ),
  )

  const dueDateLocalString = getLocalTimeString(moment(task.dueDate))

  const transposedEndOfToday = moment(
    transposeFromTimezoneToLocal(new Date(), config?.taskManager?.teamTimezone),
  )
    .endOf('day')
    .toDate()

  useEffect(() => {
    const checkIfClickedOutside = e => {
      if (
        isActionDialog &&
        taskRef.current &&
        !taskRef.current.contains(e.target)
      ) {
        setIsActionDialog(false)
      }
    }

    document.addEventListener('click', checkIfClickedOutside)

    return () => {
      document.removeEventListener('click', checkIfClickedOutside)
    }
  }, [isActionDialog])

  const daysDifference = calculateDaysDifference(
    transposedEndOfToday,
    transposedDueDate,
  )

  let daysDifferenceLabel = 'Today'
  if (daysDifference !== 0)
    daysDifferenceLabel =
      Math.abs(daysDifference) +
      (Math.abs(daysDifference) === 1 ? ' day' : ' days') +
      (daysDifference < 0 ? ' ago' : '')

  let displayDefaultDurationDaysUnit

  if (task.defaultDurationDays === null) {
    displayDefaultDurationDaysUnit = ''
  } else {
    displayDefaultDurationDaysUnit = t('common.days.day', {
      count: task.defaultDurationDays,
    })
  }

  const displayDefaultDurationDays =
    task.defaultDurationDays !== null
      ? `${task.defaultDurationDays} ${displayDefaultDurationDaysUnit}`
      : t('taskManager.task.durationDaysNone')

  const isDone = task.status === 'Done'

  const isOverdue = task.dueDate
    ? Date.now() > new Date(task.dueDate).getTime() &&
      task.status === 'In progress' &&
      !editAsTemplate
    : false

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  useEffect(() => {
    if (task.dueDate) {
      setTransposedDueDate(
        transposeFromTimezoneToLocal(
          task.dueDate,
          config?.taskManager?.teamTimezone,
        ),
      )
    }
  }, [task])

  return (
    <Draggable draggableId={task.id} index={index} key={task.id}>
      {provided => (
        <>
          <Modal isOpen={isConfirmingDelete}>
            <ModalContainer>
              {t('modals.taskDelete.permanentlyDelete')}
              <MediumRow>
                <ActionButton onClick={() => onDelete(task.id)} primary>
                  {t('modals.taskDelete.Ok')}
                </ActionButton>
                &nbsp;
                <ActionButton onClick={() => setIsConfirmingDelete(false)}>
                  {t('modals.taskDelete.Cancel')}
                </ActionButton>
              </MediumRow>
            </ModalContainer>
          </Modal>
          <TaskEditModal
            addReviewer={addReviewer}
            assigneeGroupedOptions={assigneeGroupedOptions}
            createTaskEmailNotificationLog={createTaskEmailNotificationLog}
            currentUser={currentUser}
            daysDifferenceLabel={daysDifferenceLabel}
            deleteTaskNotification={deleteTaskNotification}
            displayDefaultDurationDays={displayDefaultDurationDays}
            dueDateLocalString={dueDateLocalString}
            editAsTemplate={editAsTemplate}
            emailTemplates={emailTemplates}
            isOpen={isEditTaskMetaModal}
            isOverdue={isOverdue}
            isReadOnly={isReadOnly}
            manuscript={manuscript}
            onCancel={setIsEditTaskMetaModal}
            onSave={setIsEditTaskMetaModal}
            recipientGroupedOptions={recipientGroupedOptions}
            sendNotifyEmail={sendNotifyEmail}
            status={status}
            task={task}
            transposedDueDate={transposedDueDate}
            transposedEndOfToday={transposedEndOfToday}
            updateTask={updateTask}
            updateTaskNotification={updateTaskNotification}
          />
          <TaskRowContainer>
            <TaskRow
              isOverdue={isOverdue}
              ref={provided.innerRef}
              {...provided.draggableProps}
            >
              <TitleFieldContainer>
                <TitleCell>
                  <Handle {...provided.dragHandleProps}>
                    <DragIcon />
                  </Handle>
                  {editAsTemplate ? (
                    <Handle />
                  ) : (
                    <Handle
                      onClick={() =>
                        updateTask(task.id, {
                          ...task,
                          status: isDone ? 'In progress' : 'Done',
                        })
                      }
                      title={
                        isDone
                          ? ''
                          : t('taskManager.task.Click to mark as done')
                      }
                    >
                      {isDone ? (
                        <CheckCircle color={color.brand1.base()} />
                      ) : (
                        <Circle color={color.gray60} />
                      )}
                    </Handle>
                  )}
                  <TextInput
                    onChange={event => updateTaskTitle(event.target.value)}
                    placeholder={t('taskManager.task.Give your task a name')}
                    title={taskTitle}
                    value={taskTitle}
                  />
                  <TaskAction ref={taskRef}>
                    <MinimalButton
                      onClick={() => {
                        setIsActionDialog(!isActionDialog)
                      }}
                    >
                      <Ellipsis height="24" width="24" />
                    </MinimalButton>
                    {isActionDialog && (
                      <ActionDialog>
                        <EditLabel onClick={() => setIsEditTaskMetaModal(true)}>
                          {t('taskManager.task.Edit')}
                        </EditLabel>
                        <DeleteLabel
                          onClick={() => setIsConfirmingDelete(true)}
                        >
                          {t('taskManager.task.Delete')}
                        </DeleteLabel>
                      </ActionDialog>
                    )}
                  </TaskAction>
                </TitleCell>
              </TitleFieldContainer>
              <AssigneeFieldContainer>
                <AssigneeDropdown
                  assigneeGroupedOptions={assigneeGroupedOptions}
                  task={task}
                  unregisteredFieldsAlign="column"
                  updateTask={updateTask}
                />
              </AssigneeFieldContainer>
              {editAsTemplate ? (
                <DurationDaysFieldContainer>
                  <DurationDaysCell>
                    <CounterField
                      minValue={0}
                      onChange={val => {
                        updateTask(task.id, {
                          ...task,
                          defaultDurationDays: val,
                        })
                      }}
                      showNone
                      value={task.defaultDurationDays}
                    />
                  </DurationDaysCell>
                </DurationDaysFieldContainer>
              ) : (
                <DueDateFieldContainer>
                  <div>
                    <DueDateField
                      compact
                      displayDefaultDurationDays={displayDefaultDurationDays}
                      dueDateLocalString={dueDateLocalString}
                      task={task}
                      transposedDueDate={transposedDueDate}
                      transposedEndOfToday={transposedEndOfToday}
                      updateTask={updateTask}
                    />
                  </div>
                  <div>
                    <StatusActionCell isOverdue={isOverdue}>
                      <StatusDropdown onStatusUpdate={setTask} task={task} />
                    </StatusActionCell>
                  </div>
                </DueDateFieldContainer>
              )}
            </TaskRow>
          </TaskRowContainer>
        </>
      )}
    </Draggable>
  )
}

Task.propTypes = {
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
  index: PropTypes.number.isRequired,
  /** Callback for when a new task is abandoned before receiving a title (e.g. escape was pressed) */
  onCancel: PropTypes.func,
  onDelete: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
}

Task.defaultProps = {
  onCancel: () => {},
}

export default Task

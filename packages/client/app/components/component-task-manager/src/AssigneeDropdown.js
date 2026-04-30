/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect, react-hooks/use-memo */
/* eslint-disable react/prop-types */

import { useState, useEffect, useCallback } from 'react'
import styled from 'styled-components'
import { debounce } from 'lodash'
import { useTranslation } from 'react-i18next'
import { Select, TextInput } from '../../shared'
import theme from '../../../theme'

import tasksJson from '../../../../config/journal/tasks.json'

const { assigneeTypes } = tasksJson

const AssigneeCellContainer = styled.div`
  align-items: start;
  flex-direction: column;
  justify-content: flex-start;
`

const BaseAssigneeCell = styled.div`
  > div > div {
    font-size: ${theme.fontSizeBase};
    line-height: 1.25;

    &:nth-child(2) {
      height: 45px;
    }
  }
`

const TaskListAssigneeCell = styled(BaseAssigneeCell)`
  width: 100%;
`

const TaskMetaAssigneeCell = styled(BaseAssigneeCell)`
  justify-content: flex-start;
  width: 100%;
`

const UnregisteredFieldsAlignColumn = styled.div`
  display: flex;
  flex-direction: column;

  & > input {
    margin: 10px 10px 0 0;
  }
`

const UnregisteredFieldsAlignRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;

  > input:first-child {
    margin-right: 10px;
  }
`

const AssigneeDropdown = ({
  assigneeGroupedOptions,
  task,
  updateTask,
  unregisteredFieldsAlign = 'row',
}) => {
  const [dropdownState, setDropdownState] = useState(false)

  const [isNewUser, setIsNewUser] = useState(
    task.assigneeType === assigneeTypes.UNREGISTERED_USER,
  )

  const { t } = useTranslation()
  const [assigneeEmail, setAssigneeEmail] = useState(task?.assigneeEmail || '')
  const [assigneeName, setAssigneeName] = useState(task?.assigneeName || '')

  useEffect(() => {
    setAssigneeEmail(task.assigneeEmail)
    setIsNewUser(task.assigneeType === assigneeTypes.UNREGISTERED_USER)
    setAssigneeName(task.assigneeName)
  }, [task])

  const updateTaskAssigneeDebounce = useCallback(
    debounce(updateTask ?? (() => {}), 1000),
    [],
  )

  useEffect(() => {
    return updateTaskAssigneeDebounce.flush
  }, [])

  const updateTaskAssigneeName = value => {
    setAssigneeName(value)
    updateTaskAssigneeDebounce(task.id, {
      ...task,
      assigneeUserId: null,
      assignee: null,
      assigneeType: assigneeTypes.UNREGISTERED_USER,
      assigneeName: value,
    })
  }

  const updateTaskAssigneeEmail = value => {
    setAssigneeEmail(value)
    updateTaskAssigneeDebounce(task.id, {
      ...task,
      assigneeUserId: null,
      assignee: null,
      assigneeType: assigneeTypes.UNREGISTERED_USER,
      assigneeEmail: value,
    })
  }

  function handleAssigneeInput(selectedOption, selectedTask) {
    setDropdownState(selectedOption)

    if (!selectedOption) {
      setIsNewUser(false)
      updateTask(selectedTask.id, {
        ...selectedTask,
        assigneeUserId: null,
        assignee: null,
        assigneeType: null,
        assigneeName: null,
        assigneeEmail: null,
      })
      return
    }

    switch (selectedOption.key) {
      case 'userRole':
        setIsNewUser(false)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeType: selectedOption.value,
          assigneeUserId: null,
          assignee: null,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      case assigneeTypes.REGISTERED_USER:
        setIsNewUser(false)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeUserId: selectedOption?.value,
          assignee: selectedOption?.user,
          assigneeType: selectedOption.key,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      case assigneeTypes.UNREGISTERED_USER:
        setIsNewUser(true)
        updateTask(selectedTask.id, {
          ...selectedTask,
          assigneeUserId: null,
          assignee: null,
          assigneeType: selectedOption.key,
          assigneeName: null,
          assigneeEmail: null,
        })
        break
      default:
    }
  }

  const UnregisteredUserCell =
    unregisteredFieldsAlign === 'row'
      ? UnregisteredFieldsAlignRow
      : UnregisteredFieldsAlignColumn

  const groupedOptionsComponent = (
    <Select
      aria-label="Assignee"
      data-testid="Assignee_select"
      dropdownState={dropdownState}
      hasGroupedOptions
      isClearable
      label="Assignee"
      onChange={selected => handleAssigneeInput(selected, task)}
      options={assigneeGroupedOptions}
      placeholder={t('taskManager.task.selectAssignee')}
      value={task.assignee?.id || task.assigneeType}
    />
  )

  const newUserComponent = isNewUser && (
    <UnregisteredUserCell>
      <TextInput
        data-cy="new-user-email"
        onChange={event => updateTaskAssigneeEmail(event.target.value)}
        placeholder={t('taskManager.task.unregisteredUser.Email')}
        value={assigneeEmail}
      />
      <TextInput
        data-cy="new-user-name"
        onChange={event => updateTaskAssigneeName(event.target.value)}
        placeholder={t('taskManager.task.unregisteredUser.Name')}
        value={assigneeName}
      />
    </UnregisteredUserCell>
  )

  if (unregisteredFieldsAlign !== 'row') {
    return (
      <AssigneeCellContainer>
        <TaskListAssigneeCell title={task.assignee?.username}>
          {groupedOptionsComponent}
          {newUserComponent}
        </TaskListAssigneeCell>
      </AssigneeCellContainer>
    )
  }

  return (
    <>
      <TaskMetaAssigneeCell title={task.assignee?.username}>
        {groupedOptionsComponent}
      </TaskMetaAssigneeCell>
      {newUserComponent}
    </>
  )
}

export default AssigneeDropdown

/* eslint-disable react/prop-types */

/* stylelint-disable color-function-notation, alpha-value-notation */

import styled from 'styled-components'
import Dropdown from 'react-dropdown'
import { useMutation } from '@apollo/client'
import {
  Pause as PauseIcon,
  Check as CheckIcon,
  ChevronUp,
  ChevronDown,
} from 'react-feather'
import { useTranslation } from 'react-i18next'
import { UPDATE_TASK_STATUS } from '../../../queries'
import theme, { color } from '../../../theme'

const StartButton = styled.button`
  align-items: center;
  background: ${color.brand1.base};
  border-radius: 6px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  color: white;
  display: flex;
  font-family: ${theme.fontHeading};
  font-size: ${theme.fontSizeBase};
  font-style: normal;
  font-weight: 500;
  height: 45px;
  justify-content: center;
  letter-spacing: 0.01em;
  line-height: 19px;
  text-align: center;
  width: 111px;
`

const BaseDropdown = styled(Dropdown)`
  border-radius: 4px;
  box-shadow: 0 2px 2px rgba(0, 0, 0, 0.25);
  font-family: ${theme.fontHeading};
  font-size: 14.5px;
  font-style: normal;
  font-weight: 500;
  height: 45px;
  letter-spacing: 0.01em;
  line-height: 17px;
  width: 111px;

  .Dropdown-control {
    align-items: center;
    background-color: white;
    border: 0;
    display: flex;
    height: 100%;
    justify-content: space-between;
    padding: 6px;
    text-align: center;
  }

  .Dropdown-arrow-wrapper {
    display: flex;
  }

  .Dropdown-menu {
    border: 2px solid #ccc;
    border-radius: 2px;
    margin-left: -2px;
    margin-top: 2px;
    width: 111px;
  }
`

const DropdownLabel = styled.div`
  align-items: center;
  display: flex;

  svg {
    margin-right: 4px;
  }
`

const InProgressDropdown = styled(BaseDropdown)`
  border: 2px solid ${color.gray40};

  .Dropdown-placeholder {
    color: ${color.gray40};
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: ${color.gray40};
  }
`

const PausedDropdown = styled(BaseDropdown)`
  border: 2px solid #d29435;

  .Dropdown-placeholder {
    color: #d29435;
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: #d29435;
  }
`

const DoneDropdown = styled(BaseDropdown)`
  border: 2px solid ${color.brand1.base};

  .Dropdown-placeholder {
    color: ${color.brand1.base};
  }

  .Dropdown-arrow-wrapper > svg {
    stroke: ${color.brand1.base};
  }
`

const StatusDropdown = ({ task, onStatusUpdate }) => {
  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  const { t } = useTranslation()

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    refetchQueries: ['getTasksQuery'],
  })

  const handleStatusUpdate = async taskStatus => {
    const { data } = await updateTaskStatus({
      variables: {
        task: {
          id: task.id,
          status: taskStatus,
        },
      },
    })

    onStatusUpdate(data.updateTaskStatus)
  }

  if (task.status === status.NOT_STARTED) {
    return (
      <StartButton onClick={() => handleStatusUpdate(status.IN_PROGRESS)}>
        {t('taskManager.task.statuses.Start')}
      </StartButton>
    )
  }

  let DropdownComponent = null

  const PauseLabel = (
    <DropdownLabel>
      <PauseIcon size={15} />
      <span>
        {task.status === status.PAUSED
          ? t('taskManager.task.statuses.Paused')
          : t('taskManager.task.statuses.Pause')}
      </span>
    </DropdownLabel>
  )

  const ContinueLabel = (
    <DropdownLabel>
      <span>
        {task.status === status.IN_PROGRESS
          ? t('taskManager.task.statuses.In progress')
          : t('taskManager.task.statuses.Continue')}
      </span>
    </DropdownLabel>
  )

  const DoneLabel = (
    <DropdownLabel>
      <CheckIcon size={15} />
      <span>{t('taskManager.task.statuses.Done')}</span>
    </DropdownLabel>
  )

  const dropdownOptions = [
    { label: ContinueLabel, value: status.IN_PROGRESS },
    { label: PauseLabel, value: status.PAUSED },
    { label: DoneLabel, value: status.DONE },
  ]

  switch (task.status) {
    case status.IN_PROGRESS:
      DropdownComponent = InProgressDropdown
      break
    case status.PAUSED:
      DropdownComponent = PausedDropdown
      break
    case status.DONE:
      DropdownComponent = DoneDropdown
      break
    default:
  }

  return (
    <DropdownComponent
      arrowClosed={<ChevronDown size={20} />}
      arrowOpen={<ChevronUp size={20} />}
      onChange={selected => handleStatusUpdate(selected.value)}
      options={dropdownOptions}
      placeholder="Select status"
      value={task.status}
    />
  )
}

export default StatusDropdown

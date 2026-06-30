/* eslint-disable react/prop-types */

/* stylelint-disable color-function-notation, alpha-value-notation */

import { useContext } from 'react'
import styled from 'styled-components'
import moment from 'moment-timezone'
import { th } from '@coko/client'
import { CompactDetailLabel, MinimalDatePicker } from '../../shared'
import { ConfigContext } from '../../config/src'
import { transposeFromLocalToTimezone } from '../../../shared/dateUtils'

const BaseDueDateCell = styled.div`
  align-items: center;
  /* stylelint-disable-next-line declaration-no-important */
  background: ${th('color.gray99')} !important;
  border: 1px solid ${th('color.gray80')};
  border-radius: ${th('borderRadius')};
  box-shadow: inset 0 0 4px rgb(0 0 0 / 7%);
  display: flex;
  justify-content: flex-start;
  line-height: 1em;
  min-height: 45px;
  position: relative;

  > div {
    padding-left: 8px;
    padding-right: 8px;
    width: 100%;
  }

  button {
    color: ${th('color.gray20')};
    display: flex;
    flex-direction: row-reverse;
    font-size: ${th('fontSizeBase')};
    justify-content: space-around;
    letter-spacing: 0.01em;
    line-height: ${th('lineHeightBase')};
    width: 100%;

    svg {
      margin-right: 6px;
    }
  }
`

const CompactDueDateCell = styled(BaseDueDateCell)`
  flex: 0 0 7.8em;
  min-width: 120px;
`

const DueDateField = ({
  task,
  updateTask,
  dueDateLocalString,
  displayDefaultDurationDays,
  transposedEndOfToday,
  transposedDueDate,
  compact = false,
  position,
}) => {
  const config = useContext(ConfigContext)

  const status = {
    NOT_STARTED: 'Not started',
    START: 'Start',
    IN_PROGRESS: 'In progress',
    PAUSED: 'Paused',
    DONE: 'Done',
  }

  const DueDateCell = compact ? CompactDueDateCell : BaseDueDateCell

  return (
    <DueDateCell title={dueDateLocalString}>
      {task.status === status.NOT_STARTED || task.dueDate === null ? (
        <CompactDetailLabel>{displayDefaultDurationDays}</CompactDetailLabel>
      ) : (
        <MinimalDatePicker
          clearIcon={null}
          format="yyyy-MM-dd"
          minDate={transposedEndOfToday}
          onChange={val =>
            updateTask(task.id, {
              ...task,
              dueDate: moment
                .tz(
                  transposeFromLocalToTimezone(
                    val,
                    config?.taskManager?.teamTimezone,
                  ),
                  config?.taskManager?.teamTimezone,
                )
                .endOf('day')
                .toDate(),
            })
          }
          position={position || 'top center'}
          suppressTodayHighlight
          value={transposedDueDate}
        />
      )}
    </DueDateCell>
  )
}

export default DueDateField

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Popup from 'reactjs-popup'
import { Calendar as CalendarIcon } from 'react-feather'
import { th, grid } from '@coko/client'
import Calendar from './Calendar'
import MinimalButton from './MinimalButton'

const MainContainer = styled.div`
  align-items: stretch;
  background: ${th('colorBackground')};
  border: 2px solid ${th('colorBorder')};
  box-shadow: ${th('boxShadow')};
  display: flex;
  gap: ${grid(1)};
  padding: ${grid(2)};
`

const DatePickerCalendar = ({
  value,
  minDate,
  onChange,
  suppressTodayHighlight,
}) => {
  return (
    <MainContainer>
      <Calendar
        minDate={minDate}
        minDetail="year"
        onClickDay={val => {
          onChange(val)
        }}
        suppressTodayHighlight={suppressTodayHighlight}
        value={value}
      />
    </MainContainer>
  )
}

const MinimalDatePicker = ({
  value: initialValue,
  minDate,
  onChange,
  position,
  suppressTodayHighlight,
}) => {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  return (
    <Popup
      arrow={false}
      closeOnDocumentClick
      closeOnEscape
      on="click"
      position={position || 'bottom center'}
      trigger={() => (
        <div>
          <MinimalButton type="button">
            {value.toLocaleDateString('en-CA')}
            &nbsp;
            <CalendarIcon size={18} />
          </MinimalButton>
        </div>
      )}
    >
      {close => (
        <DatePickerCalendar
          minDate={new Date(minDate)}
          onChange={val => {
            setValue(val)
            onChange(val)
            close()
          }}
          suppressTodayHighlight={suppressTodayHighlight}
          value={new Date(value)}
        />
      )}
    </Popup>
  )
}

export default MinimalDatePicker

/* eslint-disable react-hooks/purity */
/* eslint-disable react/prop-types */

import styled from 'styled-components'
import UnstyledDatePicker from 'react-date-picker'
import { grid, th } from '@coko/client'

const StyledDatePicker = styled(UnstyledDatePicker)`
  /* stylelint-disable-next-line selector-class-pattern */
  & > div.react-date-picker__wrapper {
    border-color: ${th('colorBorder')};
    border-radius: ${th('borderRadius')};
    height: ${grid(5)};
  }
`

const DatePicker = ({ value, allowFutureDatesOnly, onChange, ...rest }) => {
  // If value exists, convert it into a Date, otherwise keep it undefined
  const date = value ? new Date(value) : undefined

  // Calculate minDate
  const minDate = allowFutureDatesOnly
    ? new Date(Date.now() + 86400000)
    : undefined // Add 1 day in milliseconds

  const dateTimestamp = date && date.getTime()

  const minDateTimestamp = minDate && minDate.getTime()

  const isDateMinDate = dateTimestamp < minDateTimestamp

  return (
    <StyledDatePicker
      {...rest}
      format="yyyy-MM-dd"
      minDate={isDateMinDate ? date : minDate}
      onChange={val => onChange(val ?? '')}
      value={date}
    />
  )
}

export default DatePicker

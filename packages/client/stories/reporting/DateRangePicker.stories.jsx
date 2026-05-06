import { useState } from 'react'
import PropTypes from 'prop-types'
import { DateRangePicker } from '../../app/components/component-reporting/src'
import DesignEmbed from '../common/utils'

const weekInMilliseconds = 7 * 24 * 60 * 60 * 1000

const DateRangePickerStateful = ({ startDate: sD, endDate: eD, max }) => {
  const [startDate, setStartDate] = useState(sD)
  const [endDate, setEndDate] = useState(eD)
  return (
    <DateRangePicker
      endDate={endDate}
      max={max}
      setDateRange={(start, end) => {
        setStartDate(start)
        setEndDate(end)
      }}
      startDate={startDate}
    />
  )
}

DateRangePickerStateful.propTypes = {
  startDate: PropTypes.number.isRequired,
  endDate: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
}

export const Base = args => <DateRangePickerStateful {...args} />

Base.args = {
  endDate: Date.now(),
  startDate: Date.now() - weekInMilliseconds,
  max: Date.now(),
}

export default {
  title: 'Reporting/DateRangePicker',
  component: DateRangePicker,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A46" />
      ),
    },
  },
}

/* eslint-disable react/prop-types */

import { useState } from 'react'
import styled from 'styled-components'
import { th, grid } from '@coko/client'
import { useTranslation } from 'react-i18next'
import Calendar from './Calendar'
import MinimalButton from './MinimalButton'
import ActionButton from './ActionButton'
import { Title } from './General'

const MainContainer = styled.div`
  align-items: stretch;
  background: ${th('colorBackground')};
  border: 2px solid ${th('colorBorder')};
  box-shadow: ${th('boxShadow')};
  display: flex;
  gap: ${grid(1)};
  padding: ${grid(2)};
`

const LeftControls = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`

const PresetsContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${grid(0.5)};
`

const VerticalDivider = styled.div`
  border-left: 2px solid ${th('colorFurniture')};
  margin: ${grid(1)};
  width: 0;
`

const DateRangeCalendar = ({
  /** An array of two Dates: [startDate, endDate]; or null. The two dates can be the same, to specify a single day. */
  value,
  onChange,
}) => {
  const [dateRange, setDateRange] = useState(value?.length === 2 ? value : [])
  const { t } = useTranslation()

  const applyOffsetRange = (startOffsetDays, endOffsetDays) => {
    const start = new Date(Date.now() + startOffsetDays * 24 * 60 * 60 * 1000)
    const end = new Date(Date.now() + endOffsetDays * 24 * 60 * 60 * 1000)
    setDateRange([start, end])
    onChange([start, end])
  }

  return (
    <MainContainer>
      <LeftControls>
        <PresetsContainer>
          <Title>{t('common.danteRangeCalendar.Presets')}</Title>
          <MinimalButton onClick={() => applyOffsetRange(0, 0)}>
            {t('common.danteRangeCalendar.Today')}
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-1, -1)}>
            {t('common.danteRangeCalendar.Yesterday')}
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-7, 0)}>
            {t('common.danteRangeCalendar.Past 7 days')}
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-30, 0)}>
            {t('common.danteRangeCalendar.Past 30 days')}
          </MinimalButton>
          <MinimalButton onClick={() => applyOffsetRange(-90, 0)}>
            {t('common.danteRangeCalendar.Past 90 days')}
          </MinimalButton>
          <MinimalButton
            onClick={() =>
              /* Probably OK if it's a day out on leap years */
              applyOffsetRange(-365, 0)
            }
          >
            {t('common.danteRangeCalendar.Past year')}
          </MinimalButton>
        </PresetsContainer>
        <ActionButton
          isCompact
          onClick={() => {
            setDateRange([])
            onChange(null)
          }}
          primary
        >
          {t('common.danteRangeCalendar.Clear')}
        </ActionButton>
      </LeftControls>
      <VerticalDivider />
      <Calendar
        minDetail="year"
        onClickDay={val => {
          const newDateRange =
            dateRange.length < 2 ? [...dateRange, val] : [val]

          newDateRange.sort((a, b) => a.getTime() - b.getTime())
          setDateRange(newDateRange)
          if (newDateRange.length === 2) onChange(newDateRange)
        }}
        selectRange
        value={dateRange.length ? dateRange : null}
      />
    </MainContainer>
  )
}

export default DateRangeCalendar

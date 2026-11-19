import type { ReactNode } from 'react'
import styled from 'styled-components'
import dayjs from 'dayjs'
import durationPlugin, { type Duration } from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(durationPlugin)
dayjs.extend(relativeTime)

type Timestamp = string | number | Date

type DateParserProps = {
  /** The date string. Can be any date parsable by dayjs. */
  timestamp: Timestamp
  /** Format of the rendered date. */
  dateFormat?: string
  /** Humanize duration threshold. ie. If the time between now and the date is
   * less than this value in days, the date is converted to a human-readable
   * form (eg. "one hour ago").
   */
  humanizeThreshold?: number
}

const getDuration = (timestamp: Timestamp): Duration => {
  const today = dayjs()
  const stamp = dayjs(timestamp)
  return dayjs.duration(today.diff(stamp))
}

const Wrapper = styled.span``

const DateParser = (props: DateParserProps): ReactNode => {
  const { timestamp, dateFormat = 'DD.MM.YYYY', humanizeThreshold = 0 } = props
  if (!timestamp) return null

  const duration = getDuration(timestamp)

  const timestampValue =
    duration.asDays() < humanizeThreshold
      ? `${duration.humanize()} ago`
      : dayjs(timestamp).format(dateFormat)

  return <Wrapper>{timestampValue}</Wrapper>
}

export default DateParser

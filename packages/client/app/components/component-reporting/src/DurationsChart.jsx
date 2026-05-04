import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Label,
  ResponsiveContainer,
} from 'recharts'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { monthAbbrevs } from '../../../shared/dateUtils'
import { getLanguages } from '../../../i18n'

const Container = styled.div`
  height: 300px;
  width: 750px;
`

const generateSeries = data => {
  const reviewSeries = []
  const completionSeries = []
  const incompleteStarts = []
  let maxDuration = 0

  data.forEach(datum => {
    if (datum.reviewDuration === null) {
      incompleteStarts.push({ x: datum.date, y: 0 })
    } else {
      reviewSeries.push({ x: datum.date, y: 0 })
      reviewSeries.push({ x: datum.date, y: datum.reviewDuration })
      reviewSeries.push(null)

      if (datum.reviewDuration > maxDuration) maxDuration = datum.reviewDuration

      if (datum.fullDuration === null) {
        incompleteStarts.push({ x: datum.date, y: datum.reviewDuration })
      } else {
        completionSeries.push({ x: datum.date, y: datum.reviewDuration })
        completionSeries.push({ x: datum.date, y: datum.fullDuration })
        completionSeries.push(null)

        if (datum.fullDuration > maxDuration) maxDuration = datum.fullDuration
      }
    }
  })

  const rangeMax = Math.max(1, Math.ceil(maxDuration)) // integer, at least 1
  const incompleteSeries = []
  incompleteStarts.forEach(item => {
    incompleteSeries.push(item)
    incompleteSeries.push({ x: item.x, y: rangeMax })
    incompleteSeries.push(null)
  })

  return { reviewSeries, completionSeries, incompleteSeries, rangeMax }
}

const day = 24 * 60 * 60 * 1000

const dateFormatter = timestamp => {
  const date = new Date(timestamp)
  let monthNames = monthAbbrevs
  const curLang = getLanguages().find(elem => elem.value === i18next.language)
  if (curLang?.monthAbbrevs) monthNames = curLang.monthAbbrevs

  return `${monthNames[date.getUTCMonth()]} ${date.getUTCDate()}`
}

const getTicks = (startTimestamp, endTimestamp) => {
  const result = []
  let date = new Date(startTimestamp)
  date.setUTCHours(0)
  date.setUTCMinutes(0)
  date.setUTCSeconds(0)
  date.setUTCMilliseconds(0)

  date = new Date(date.getTime() + day)

  while (date.getTime() < endTimestamp) {
    result.push(date.getTime())
    date = new Date(date.getTime() + day)
  }

  return result
}

const DurationsLabel = () => {
  const { t } = useTranslation()
  return (
    <>
      <text transform="rotate(-90, 14, 260)" x={14} y={260}>
        <tspan>{t('reportsPage.Days spent on')} </tspan>
        <tspan fill="#ffa900">{t('reportsPage.daysSpentReview')} </tspan>
        <tspan fill="#475ae8">{t('reportsPage.daysSpentPostreview')}</tspan>
      </text>
      <text fill="#dddddd" transform="rotate(-90, 32, 260)" x={32} y={260}>
        {t('reportsPage.or incomplete')}
      </text>
    </>
  )
}

const DurationsChart = ({
  startDate,
  endDate,
  durationsData,
  reviewAvgsTrace,
  completionAvgsTrace,
}) => {
  const { t } = useTranslation()

  const { reviewSeries, completionSeries, incompleteSeries, rangeMax } =
    generateSeries(durationsData)

  return (
    <Container>
      <ResponsiveContainer height="100%" width="100%">
        <LineChart height={400} width={500}>
          <XAxis
            allowDataOverflow={false}
            dataKey="x"
            domain={[startDate, endDate]}
            hasTick
            name="date"
            scale="time"
            tickFormatter={dateFormatter}
            ticks={getTicks(startDate, endDate, 7)}
            type="number"
          >
            <Label
              offset={-5}
              position="insideBottom"
              value={t('reportsPage.Submission date')}
            />
          </XAxis>
          <YAxis
            axisLine={false}
            dataKey="y"
            domain={[0, rangeMax]}
            name="duration"
            type="number"
          >
            <Label content={<DurationsLabel />} position="insideLeft" />
          </YAxis>
          <Line
            animationBegin={1500}
            animationDuration={(1000 * incompleteSeries.length) / 12}
            data={incompleteSeries}
            dataKey="y"
            dot={false}
            stroke="#dddddd"
            strokeLinejoin="bevel"
            strokeWidth={2}
          />
          <Line
            animationDuration={(1000 * reviewSeries.length) / 12}
            data={reviewSeries}
            dataKey="y"
            dot={false}
            stroke="#ffa900"
            strokeLinejoin="bevel"
            strokeWidth={2}
          />
          <Line
            animationBegin={1000}
            animationDuration={(1000 * completionSeries.length) / 12}
            data={completionSeries}
            dataKey="y"
            dot={false}
            stroke="#475ae8"
            strokeLinejoin="bevel"
            strokeWidth={2}
          />
          <Line
            animationBegin={1800}
            animationDuration={1000}
            data={reviewAvgsTrace}
            dataKey="y"
            dot={false}
            stroke="#ffa900"
            strokeLinejoin="bevel"
            strokeOpacity={0.4}
            type="monotone"
          />
          <Line
            animationBegin={1800}
            animationDuration={1000}
            data={completionAvgsTrace}
            dataKey="y"
            dot={false}
            stroke="#475ae8"
            strokeLinejoin="bevel"
            strokeOpacity={0.4}
            type="monotone"
          />
        </LineChart>
      </ResponsiveContainer>
    </Container>
  )
}

DurationsChart.propTypes = {
  /** Start of date (x) axis, ms since epoch */
  startDate: PropTypes.number.isRequired,
  /** End of date (x) axis, ms since epoch */
  endDate: PropTypes.number.isRequired,
  /** Manuscripts expressed as an array of {date, reviewDuration, fullDuration},
   * where date is submitted datetime (ms since epoch),
   * reviewDuration is days from submission until last review completed (or null if reviews still pending),
   * and completionDuration is days from submission until either the most recent publication date or rejection date (or null if not published or rejected) */
  durationsData: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.number.isRequired,
      reviewDuration: PropTypes.number,
      fullDuration: PropTypes.number,
    }).isRequired,
  ).isRequired,
  /** x,y coordinates for a continuous trace showing running average review durations */
  reviewAvgsTrace: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ).isRequired,
  /** x,y coordinates for a continuous trace showing running average completion (published or rejected) durations */
  completionAvgsTrace: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  ).isRequired,
}

export default DurationsChart

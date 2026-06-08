/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/rules-of-hooks, react-hooks/purity */

import PropTypes from 'prop-types'
import styled from 'styled-components'
import { forEach, map } from 'lodash'
import { th, grid } from '@coko/client'
import { Trans, useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { Icon } from '../../pubsweet'
import DateRangePicker from './DateRangePicker'
import SummaryReport from './SummaryReport'
import Table from './Table'
import SparkBar from './SparkBar'
import Tooltip from './Tooltip'
import { color } from '../../../theme'

const Page = styled.div`
  flex: 1 1 100%;
  height: 100vh;
  overflow-y: auto;
  padding: 0 ${grid(2)} ${grid(3)} ${grid(2)};
`

const Select = styled.select`
  border: 1px solid ${th('colorBorder')};
  padding: 5px;
`

const Heading = styled.div`
  color: ${color.brand1.base};
  font-family: ${th('fontReading')};
  font-size: ${th('fontSizeHeading3')};
  line-height: ${th('lineHeightHeading3')};
  margin: ${th('gridUnit')} 0;
`

const MinorNote = styled.span`
  color: ${color.gray50};
  font-size: 80%;
`

export const Content = styled.div`
  background-color: ${color.backgroundC};
  border-radius: ${th('borderRadius')};
  box-shadow: ${th('boxShadow')};
`

const SelectionLine = styled.div`
  margin-bottom: 1.5em;
  position: relative;
  z-index: 3;
`

const ReviewNote = styled.div`
  color: ${color.gray50};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  & strong {
    color: ${color.text};
    font-weight: normal;
  }
`

const CompletedIcon = () => {
  const { t } = useTranslation()

  return (
    <div
      data-testid="completed-svg"
      style={{ display: 'inline-block' }}
      title={t('reviewerStatus.completed')}
    >
      <div
        style={{
          width: '0.3em',
          overflowX: 'visible',
          display: 'inline-block',
        }}
      >
        <Icon color="green" key="com" size={2}>
          check
        </Icon>
      </div>
      <Icon color="darkgreen" key="com" size={2}>
        check
      </Icon>
    </div>
  )
}

const InvitedIcon = () => {
  const { t } = useTranslation()

  return (
    <span data-testid="invited-svg">
      <Icon
        color="cornflowerblue"
        key="inv"
        size={2}
        title={t('reviewerStatus.invited')}
      >
        send
      </Icon>
    </span>
  )
}

const AcceptedIcon = () => {
  const { t } = useTranslation()

  return (
    <span data-testid="accepted-svg">
      <Icon
        color="lightgreen"
        key="inv"
        size={2}
        title={t('reviewerStatus.accepted')}
      >
        check
      </Icon>
    </span>
  )
}

const RejectedIcon = () => {
  const { t } = useTranslation()

  return (
    <span data-testid="rejected-svg">
      <Icon
        color="darkred"
        key="inv"
        size={2}
        title={t('reviewerStatus.rejected')}
      >
        slash
      </Icon>
    </span>
  )
}

const InProgressIcon = () => {
  const { t } = useTranslation()

  return (
    <span data-testid="inProgress-svg">
      <Icon
        color="cornflowerblue"
        key="edit"
        size={2}
        title={t('reviewerStatus.inProgress')}
      >
        edit
      </Icon>
    </span>
  )
}

const getTableDataWithSparkBars = (rows, labelMapper) => {
  if (rows.length < 1) return []

  // Find maximum values in each column (or 0 for non-numeric or negative data)
  const columnMaxima = {}
  forEach(rows[0], (_, key) => {
    columnMaxima[key] = rows.reduce((max, row) => {
      let val = row[key]
      if (typeof val !== 'number') val = 0
      return Math.max(max, val)
    }, 0)
  })

  // Return all rows, substituting a SparkBar for numbers. If a labelMapper function is supplied, derive cell text using this.
  return rows.map(row =>
    map(row, (val, key) => {
      if (typeof val !== 'number')
        return labelMapper ? labelMapper(val, key) : val
      return (
        <SparkBar
          color={color.brand2.tint70()}
          label={labelMapper && labelMapper(val, key)}
          onClick={undefined}
          rangeMax={columnMaxima[key]}
          value={val}
        />
      )
    }),
  )
}

const ReviewerNamesWithStatuses = ({ reviewers }) => {
  if (reviewers.length <= 0) return null
  return (
    <div>
      {reviewers.map((r, i) => (
        <span data-testid="reviewer-record" key={r.name}>
          {i > 0 ? `, ${r.name}` : r.name}
          {r.status === 'invited' && <InvitedIcon />}
          {r.status === 'accepted' && <AcceptedIcon />}
          {r.status === 'rejected' && <RejectedIcon />}
          {r.status === 'inProgress' && <InProgressIcon />}
          {r.status === 'completed' && <CompletedIcon />}
        </span>
      ))}
    </div>
  )
}

/** Returns text like "Review took 1 day" or "Reviews took 3.1, 2.2 days"
 * or if a review is still in progress, "Previous reviews took 1.2, 2.3 days". If no reviews are completed yet, returns null.
 * The numbers themselves are displayed in &lt;strong&gt;&lt;/strong&gt;. */
const ReviewDurations = ({ durations }) => {
  const isCurrentlyReviewing =
    durations.length > 0 && durations[durations.length - 1] === null

  const completedDurations = (
    isCurrentlyReviewing ? durations.slice(0, durations.length - 1) : durations
  ).map(d => Math.round(d * 10) / 10)

  if (completedDurations.length <= 0) return null

  let i18nKey = 'reportsPage.tables.manuscripts.'
  if (completedDurations.length === 1)
    i18nKey += isCurrentlyReviewing ? 'prevReviewDuration' : 'reviewDuration'
  else
    i18nKey += isCurrentlyReviewing ? 'prevReviewDurations' : 'reviewDurations'
  const durationsString = completedDurations.join(', ')

  return (
    <ReviewNote>
      <Trans
        components={{ strong: <strong /> }}
        count={completedDurations[0]}
        i18nKey={i18nKey}
        values={{ durations: durationsString }}
      />
    </ReviewNote>
  )
}

const renderReviewInfo = ({ reviewers, durations }) => {
  return (
    <>
      <ReviewerNamesWithStatuses reviewers={reviewers} />
      <ReviewDurations durations={durations} />
    </>
  )
}

const getReport = (
  reportType,
  startDate,
  endDate,
  getSummaryData,
  getManuscriptsData,
  getEditorsData,
  getReviewersData,
  getAuthorsData,
) => {
  const { t } = useTranslation()

  if (reportType === 'Summary') {
    return (
      <SummaryReport
        endDate={endDate}
        startDate={startDate}
        {...getSummaryData(startDate, endDate)}
      />
    )
  }

  if (reportType === 'Manuscript') {
    const data = getManuscriptsData(startDate, endDate).map(d => ({
      shortId: d.shortId,
      entryDate: new Date(d.entryDate).toLocaleDateString(i18next.language),
      title: d.title,
      authors: d.authors,
      editors: d.editors,
      reviews: { reviewers: d.reviewers, durations: d.versionReviewDurations },
      status: t(`msStatus.${d.status}`, d.status),
      publishedDate: d.publishedDate
        ? new Date(d.publishedDate).toLocaleDateString(i18next.language)
        : null,
    }))

    const rows = getTableDataWithSparkBars(data, (val, key) => {
      if (['editors', 'authors'].includes(key))
        return val
          .map(u => u.username || u.email || u.defaultIdentity.identifier)
          .join(', ')
      if (key === 'reviews') return renderReviewInfo(val)

      return val
    })

    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: t('reportsPage.tables.manuscripts.Manuscript number'), name: 'shortId', width: '6.5em' },
          { heading: t('reportsPage.tables.manuscripts.Entry date'), name: 'entryDate', width: '7em' },
          { heading: t('reportsPage.tables.manuscripts.Title'), name: 'title', width: '16em', flexGrow: 4 },
          { heading: t('reportsPage.tables.manuscripts.Author'), name: 'authors', width: '12em', flexGrow: 1 },
          { heading: t('reportsPage.tables.manuscripts.Editors'), name: 'editors', width: '12em', flexGrow: 3 },
          { heading: t('reportsPage.tables.manuscripts.Reviewers'), name: 'reviews', width: '14em', flexGrow: 3 },
          { heading: t('reportsPage.tables.manuscripts.Status'), name: 'status', width: '6em' },
          { heading: t('reportsPage.tables.manuscripts.Published date'), name: 'publishedDate', width: '7em' },
        ]}
        rows={rows}
      />
    )
  }

  if (reportType === 'Editor') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: t('reportsPage.tables.editor.Editor name'), name: 'name', width: '12em', flexGrow: 3 },
          { heading: t('reportsPage.tables.editor.Manuscripts assigned'), name: 'assignedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.editor.Assigned for review'), name: 'givenToReviewersCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.editor.Revised'), name: 'revisedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.editor.Rejected'), name: 'rejectedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.editor.Accepted'), name: 'acceptedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.editor.Published'), name: 'publishedCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(getEditorsData(startDate, endDate))}
      />
    )
  }

  if (reportType === 'Reviewer') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: t('reportsPage.tables.reviewer.Reviewer name'), name: 'name', width: '12em', flexGrow: 3 },
          { heading: t('reportsPage.tables.reviewer.Review invites'), name: 'invitesCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Invites declined'), name: 'declinedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Reviews completed'), name: 'reviewsCompletedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Average review duration'), name: 'avgReviewDuration', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Recommended to accept'), name: 'reccAcceptCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Recommended to revise'), name: 'reccReviseCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.reviewer.Recommended to reject'), name: 'reccRejectCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(
          getReviewersData(startDate, endDate),
          (val, column) => {
            if (column !== 'avgReviewDuration') return val
            const roundedVal = Math.round(val * 10) / 10
            return (
              <Trans
                count={roundedVal}
                i18nKey="reportsPage.tables.reviewer.days"
                values={{ days: roundedVal }}
              />
            )
          },
        )}
      />
    )
  }

  if (reportType === 'Author') {
    return (
      <Table
        // prettier-ignore
        columnSchemas={[
          { heading: t('reportsPage.tables.author.Author name'), name: 'name', width: '12em', flexGrow: 3 },
          { heading: t('msStatus.new'), name: 'unsubmittedCount', width: '7em', flexGrow: 1 },
          { heading: t('msStatus.submitted'), name: 'submittedCount', width: '7em', flexGrow: 1 },
          { heading: t('msStatus.rejected'), name: 'rejectedCount', width: '7em', flexGrow: 1 },
          { heading: t('reportsPage.tables.author.revisionRequested'), name: 'revisionCount', width: '7em', flexGrow: 1 },
          { heading: t('msStatus.accepted'), name: 'acceptedCount', width: '7em', flexGrow: 1 },
          { heading: t('msStatus.published'), name: 'publishedCount', width: '7em', flexGrow: 1 },
        ]}
        rows={getTableDataWithSparkBars(getAuthorsData(startDate, endDate))}
      />
    )
  }

  return null
}

const Report = ({
  reportType,
  reportTypes,
  startDate,
  endDate,
  setReportType,
  setStartDate,
  setEndDate,
  getSummaryData,
  getManuscriptsData,
  getEditorsData,
  getReviewersData,
  getAuthorsData,
}) => {
  const { t } = useTranslation()
  return (
    <Page>
      <Heading>{t('reportsPage.Reports')}</Heading>
      <SelectionLine data-testid="report-options">
        {t('reportsPage.Show')}{' '}
        <Select
          onChange={e => setReportType(e.target.value)}
          value={reportType}
        >
          {reportTypes.map(type => (
            <option key={type.value} label={type.label} value={type.value} />
          ))}
        </Select>{' '}
        <span>
          {t('reportsPage.activityForManuscripts')}
          <Tooltip
            content={
              <Trans i18nKey="reportsPage.activityForManuscriptsTooltip" />
            }
          />
        </span>{' '}
        <DateRangePicker
          endDate={endDate}
          max={Date.now()}
          setDateRange={(start, end) => {
            setStartDate(start)
            setEndDate(end)
          }}
          startDate={startDate}
        />{' '}
        <MinorNote>UTC</MinorNote>
      </SelectionLine>
      <Content>
        {getReport(
          reportType,
          startDate,
          endDate,
          getSummaryData,
          getManuscriptsData,
          getEditorsData,
          getReviewersData,
          getAuthorsData,
        )}
      </Content>
    </Page>
  )
}

Report.propTypes = {
  reportType: PropTypes.string.isRequired,
  reportTypes: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  /** Start of range for reporting, ms since epoch */
  startDate: PropTypes.number.isRequired,
  /** End of range for reporting, ms since epoch */
  endDate: PropTypes.number.isRequired,
  setReportType: PropTypes.func.isRequired,
  setStartDate: PropTypes.func.isRequired,
  setEndDate: PropTypes.func.isRequired,
  getSummaryData: PropTypes.func.isRequired,
  getManuscriptsData: PropTypes.func.isRequired,
  getEditorsData: PropTypes.func.isRequired,
  getReviewersData: PropTypes.func.isRequired,
  getAuthorsData: PropTypes.func.isRequired,
}

export default Report

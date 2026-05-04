/* eslint-disable react-hooks/purity */

import { useContext, useState } from 'react'
import { gql } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import i18next from 'i18next'
import Report from './Report'
import { getStartOfDay, getEndOfDay } from '../../../shared/dateUtils'
import { Spinner, CommsErrorBanner } from '../../shared'
import { ConfigContext } from '../../config/src'

const getReportData = gql`
  query reportData(
    $startDate: DateTime
    $endDate: DateTime
    $groupId: ID!
    $timeZoneOffset: Int
  ) {
    summaryActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
      timeZoneOffset: $timeZoneOffset
    ) {
      avgPublishTimeDays
      avgReviewTimeDays
      unsubmittedCount
      submittedCount
      unassignedCount
      reviewInvitedCount
      reviewInviteAcceptedCount
      reviewedCount
      rejectedCount
      revisingCount
      acceptedCount
      publishedCount
      publishedTodayCount
      revisingNowCount
      avgPublishedDailyCount
      avgInProgressDailyCount
      durationsData {
        date
        reviewDuration
        fullDuration
      }
      reviewAvgsTrace {
        x
        y
      }
      completionAvgsTrace {
        x
        y
      }
    }
    manuscriptsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      shortId
      entryDate
      title
      authors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      editors {
        id
        username
        email
        defaultIdentity {
          id
          identifier
        }
      }
      reviewers {
        id
        name
        status
      }
      status
      publishedDate
      versionReviewDurations
    }
    editorsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      assignedCount
      givenToReviewersCount
      revisedCount
      rejectedCount
      acceptedCount
      publishedCount
    }
    reviewersActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      invitesCount
      declinedCount
      reviewsCompletedCount
      avgReviewDuration
      reccReviseCount
      reccAcceptCount
      reccRejectCount
    }
    authorsActivity(
      startDate: $startDate
      endDate: $endDate
      groupId: $groupId
    ) {
      name
      unsubmittedCount
      submittedCount
      rejectedCount
      revisionCount
      acceptedCount
      publishedCount
    }
  }
`

const removeTypeName = rows => {
  if (!rows) return []
  return rows.map(row => {
    const newRow = { ...row }

    delete newRow.__typename
    return newRow
  })
}

const defaultReportDuration = 31 * 24 * 60 * 60 * 1000 // 31 days

const reportTypes = [
  { label: i18next.t('reportsPage.reportTypes.Summmary'), value: 'Summary' },
  {
    label: i18next.t('reportsPage.reportTypes.Manuscript'),
    value: 'Manuscript',
  },
  { label: i18next.t('reportsPage.reportTypes.Editor'), value: 'Editor' },
  { label: i18next.t('reportsPage.reportTypes.Reviewer'), value: 'Reviewer' },
  { label: i18next.t('reportsPage.reportTypes.Author'), value: 'Author' },
]

const ReportPage = () => {
  const config = useContext(ConfigContext)

  const [startDate, setStartDate] = useState(
    getStartOfDay(Date.now() - defaultReportDuration).getTime(),
  )

  const [endDate, setEndDate] = useState(getEndOfDay(Date.now()).getTime())

  const [reportType, setReportType] = useState(reportTypes[0].value)

  const { data, loading, error } = useQuery(getReportData, {
    variables: {
      startDate,
      endDate,
      groupId: config.groupId,
      timeZoneOffset: new Date().getTimezoneOffset(),
    },
    fetchPolicy: 'network-only',
  })

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <Report
      endDate={endDate}
      getAuthorsData={() => removeTypeName(data?.authorsActivity)}
      getEditorsData={() => removeTypeName(data?.editorsActivity)}
      getManuscriptsData={() => removeTypeName(data?.manuscriptsActivity)}
      getReviewersData={() => removeTypeName(data?.reviewersActivity)}
      getSummaryData={() => data?.summaryActivity}
      reportType={reportType}
      reportTypes={reportTypes}
      setEndDate={setEndDate}
      setReportType={setReportType}
      setStartDate={setStartDate}
      startDate={startDate}
    />
  )
}

export default ReportPage

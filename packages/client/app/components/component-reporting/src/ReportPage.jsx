/* eslint-disable react-hooks/purity */

import { useContext, useState } from 'react'
import { useQuery } from '@apollo/client/react'
import i18next from 'i18next'
import Report from './Report'
import { getStartOfDay, getEndOfDay } from '../../../shared/dateUtils'
import { Spinner, CommsErrorBanner } from '../../shared'
import { ConfigContext } from '../../config/src'
import { GET_REPORT_DATA } from '../../../queries'

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

  const { data, loading, error } = useQuery(GET_REPORT_DATA, {
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

import { type ComponentProps, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Spinner } from '../../../components/shared/Spinner'
import CommsErrorBanner from '../../../components/shared/CommsErrorBanner'
import Page from '../../shared/Page'
import BackLink from '../../shared/BackLink'
import ManuscriptsTable from '../../shared/ManuscriptsTable'

type TableProps = Omit<ComponentProps<typeof ManuscriptsTable>, 'loading'>

type DashboardManuscriptsTableProps = TableProps & {
  title: string
  loading: boolean
  error?: unknown
}

const DashboardManuscriptsTable = (
  props: DashboardManuscriptsTableProps,
): ReactNode => {
  const { title, loading, error, ...tableProps } = props
  const { groupName } = useParams()
  const { t } = useTranslation()

  return (
    <Page title={title}>
      <BackLink
        href={`/${groupName}/dashboard`}
        label={t('dashboardPage.backToDashboard')}
      />

      {loading && <Spinner />}
      {error && <CommsErrorBanner error={error} />}
      {!loading && !error && <ManuscriptsTable {...tableProps} />}
    </Page>
  )
}

export default DashboardManuscriptsTable

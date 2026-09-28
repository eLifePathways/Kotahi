import { type ReactNode } from 'react'

import useManuscriptsTable from './hooks/useManuscriptsTable'
import DashboardManuscriptsTable from '../ui/pages/dashboardManuscriptsTable/DashboardManuscriptsTable'

type DashboardManuscriptsPageProps = {
  variant: 'submitter' | 'reviewer' | 'editor'
  title: string
}

const DashboardManuscriptsPage = (
  props: DashboardManuscriptsPageProps,
): ReactNode => {
  const { variant, title } = props
  const { loading, error, ...tableProps } = useManuscriptsTable(variant)

  return (
    <DashboardManuscriptsTable
      error={error}
      loading={loading}
      title={title}
      {...tableProps}
    />
  )
}

export default DashboardManuscriptsPage

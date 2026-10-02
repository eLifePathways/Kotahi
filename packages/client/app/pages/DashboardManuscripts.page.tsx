import { type ReactNode, useContext } from 'react'
import { Navigate, useParams } from 'react-router-dom'

import { ConfigContext } from '../components/config/src'
import useManuscriptsTable from './hooks/useManuscriptsTable'
import DashboardManuscriptsTable from '../ui/pages/dashboardManuscriptsTable/DashboardManuscriptsTable'

const VARIANT_SECTIONS = {
  submitter: 'submission',
  reviewer: 'review',
  editor: 'editor',
} as const

type DashboardManuscriptsPageProps = {
  variant: 'submitter' | 'reviewer' | 'editor'
  title: string
}

const DashboardManuscripts = (
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

const DashboardManuscriptsPage = (
  props: DashboardManuscriptsPageProps,
): ReactNode => {
  const { variant } = props
  const { groupName } = useParams()
  const config = useContext(ConfigContext)

  // @ts-ignore
  const showSections: string[] = config?.dashboard?.showSections ?? []

  if (!showSections.includes(VARIANT_SECTIONS[variant])) {
    return <Navigate replace to={`/${groupName}/dashboard`} />
  }

  return <DashboardManuscripts {...props} />
}

export default DashboardManuscriptsPage

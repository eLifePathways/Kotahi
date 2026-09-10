/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation } from '@apollo/client/react'
import { useEffect, useContext } from 'react'
import { ConfigContext } from '../../../config/src'
import { UPDATE_TAB } from '../../../../queries'
import SubmissionsTable from './sections/SubmissionsTable'

const DashboardSubmissionsPage = () => {
  const config = useContext(ConfigContext)

  const [updateTab] = useMutation(UPDATE_TAB)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'submissions',
      },
    })
  }, [])

  const showSubmissions =
    config?.dashboard?.showSections?.includes('submission')

  if (!showSubmissions) return null

  return <SubmissionsTable />
}

export default DashboardSubmissionsPage

/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'
import { ConfigContext } from '../../../config/src'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import { UPDATE_TAB, DASHBOARD } from '../../../../queries'
import SubmissionsTable from './sections/SubmissionsTable'
import { CommsErrorBanner, Spinner } from '../../../shared'
import { useCurrentUser } from '../../../../pages/hooks/useCurrentUser'

const DashboardSubmissionsPage = () => {
  const location = useLocation()
  const config = useContext(ConfigContext)
  const wantedRoles = ['author']

  const currentUser = useCurrentUser()

  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)

  const limit = config?.manuscript?.paginationCount || 10

  const { loading, error, data, previousData } = useQuery(DASHBOARD, {
    variables: {
      wantedRoles,
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
      searchInAllVersions: false,
    },
    fetchPolicy: 'network-only',
  })

  const currentData = data ?? previousData

  const [updateTab] = useMutation(UPDATE_TAB)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'submissions',
      },
    })
  }, [])

  if (loading && !currentData) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  const showSubmissions =
    config?.dashboard?.showSections?.includes('submission')

  if (!showSubmissions) return null

  return (
    <SubmissionsTable
      applyQueryParams={applyQueryParams}
      currentUser={currentUser}
      manuscriptsUserHasCurrentRoleIn={
        currentData.manuscriptsUserHasCurrentRoleIn
      }
      submissionForm={currentData.formForPurposeAndCategory}
      uriQueryParams={uriQueryParams}
    />
  )
}

export default DashboardSubmissionsPage

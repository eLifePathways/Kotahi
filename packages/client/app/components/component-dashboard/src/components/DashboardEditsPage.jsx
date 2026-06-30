/* eslint-disable react-hooks/exhaustive-deps */

import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useContext } from 'react'
import { useLocation } from 'react-router-dom'

import { ConfigContext } from '../../../config/src'
import { useCurrentUser } from '../../../../pages/hooks/useCurrentUser'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import {
  UPDATE_TAB,
  REMOVE_TASK_ALERTS_FOR_CURRENT_USER,
  DASHBOARD,
  UPDATE_MANUSCRIPT,
} from '../../../../queries'
import EditorTable from './sections/EditorTable'
import { CommsErrorBanner, Spinner } from '../../../shared'

const DashboardEditsPage = () => {
  const location = useLocation()
  const config = useContext(ConfigContext)
  const wantedRoles = ['seniorEditor', 'handlingEditor', 'editor']

  const currentUser = useCurrentUser()

  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)

  const limit = config?.manuscript?.paginationCount || 10

  const { data, loading, error } = useQuery(DASHBOARD, {
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

  const [updateTab] = useMutation(UPDATE_TAB)

  const [update] = useMutation(UPDATE_MANUSCRIPT)
  const [doUpdateManuscript] = useMutation(UPDATE_MANUSCRIPT)

  const setReadyToEvaluateLabels = id => {
    update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            $customStatus: 'readyToEvaluate',
          },
        }),
      },
    })
  }

  const unsetCustomStatus = id => {
    update({
      variables: {
        id,
        input: JSON.stringify({
          submission: {
            $customStatus: null,
          },
        }),
      },
    })
  }

  const [removeTaskAlertsForCurrentUser] = useMutation(
    REMOVE_TASK_ALERTS_FOR_CURRENT_USER,
  )

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'edits',
      },
    })
    removeTaskAlertsForCurrentUser()
  }, [])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return (
    <EditorTable
      applyQueryParams={applyQueryParams}
      currentUser={currentUser}
      doUpdateManuscript={doUpdateManuscript}
      manuscriptsUserHasCurrentRoleIn={data.manuscriptsUserHasCurrentRoleIn}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      submissionForm={data.formForPurposeAndCategory}
      unsetCustomStatus={unsetCustomStatus}
      uriQueryParams={uriQueryParams}
    />
  )
}

export default DashboardEditsPage

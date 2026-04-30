/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useMutation, useQuery } from '@apollo/client'
import { useEffect, useContext } from 'react'
import { ConfigContext } from '../../../config/src'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import mutations from '../graphql/mutations'
import queries from '../graphql/queries'
import EditorTable from './sections/EditorTable'
import { CommsErrorBanner, Spinner } from '../../../shared'

import { updateMutation } from '../../../component-submit/src/components/SubmitPage'
import { updateManuscriptMutation } from '../../../component-review/src/components/DecisionPage'

const DashboardEditsPage = ({ currentUser, history }) => {
  const config = useContext(ConfigContext)
  const wantedRoles = ['seniorEditor', 'handlingEditor', 'editor']

  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)

  const limit = config?.manuscript?.paginationCount || 10

  const { data, loading, error } = useQuery(queries.dashboard, {
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

  const [updateTab] = useMutation(mutations.updateTab)

  const [update] = useMutation(updateMutation)
  const [doUpdateManuscript] = useMutation(updateManuscriptMutation)

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
    mutations.removeTaskAlertsForCurrentUserMutation,
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

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/prop-types */

import { useMutation, useQuery } from '@apollo/client/react'
import { useEffect, useContext } from 'react'
import { ConfigContext } from '../../../config/src'
import { UPDATE_REVIEWER_STATUS_MUTATION } from '../../../../queries/team'
import {
  extractFilters,
  extractSortData,
  URI_PAGENUM_PARAM,
  URI_REVIEWER_STATUS_PARAM,
  useQueryParams,
} from '../../../../shared/urlParamUtils'
import mutations from '../graphql/mutations'
import queries from '../graphql/queries'
import ReviewerTable from './sections/ReviewerTable'
import { CommsErrorBanner, Spinner } from '../../../shared'
import { updateMutation } from '../../../component-submit/src/components/SubmitPage'
import { updateManuscriptMutation } from '../../../component-review/src/components/DecisionPage'

const DashboardReviewsPage = ({ currentUser, history }) => {
  const config = useContext(ConfigContext)

  const wantedRoles = [
    'reviewer',
    'invited:reviewer',
    'accepted:reviewer',
    'inProgress:reviewer',
    'completed:reviewer',
    'collaborativeReviewer',
    'invited:collaborativeReviewer',
    'accepted:collaborativeReviewer',
    'inProgress:collaborativeReviewer',
    'completed:collaborativeReviewer',
  ]

  const applyQueryParams = useQueryParams()

  const uriQueryParams = new URLSearchParams(history.location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const sortName = extractSortData(uriQueryParams).name
  const sortDirection = extractSortData(uriQueryParams).direction
  const filters = extractFilters(uriQueryParams)

  const limit = config?.manuscript?.paginationCount || 10

  const { loading, error, data } = useQuery(queries.dashboard, {
    variables: {
      reviewerStatus: uriQueryParams.get(URI_REVIEWER_STATUS_PARAM),
      wantedRoles,
      sort: sortName
        ? { field: sortName, isAscending: sortDirection === 'ASC' }
        : null,
      offset: (page - 1) * limit,
      limit,
      filters,
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      groupId: config.groupId,
      searchInAllVersions: true,
    },
    fetchPolicy: 'network-only',
  })

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

  const [updateTab] = useMutation(mutations.updateTab)
  const [reviewerRespond] = useMutation(mutations.reviewerResponseMutation)
  const [updateReviewerStatus] = useMutation(UPDATE_REVIEWER_STATUS_MUTATION)

  useEffect(() => {
    updateTab({
      variables: {
        tab: 'reviews',
      },
    })
  }, [])

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  return config?.dashboard?.showSections?.includes('review') ? (
    <ReviewerTable
      applyQueryParams={applyQueryParams}
      currentUser={currentUser}
      doUpdateManuscript={doUpdateManuscript}
      manuscriptsUserHasCurrentRoleIn={data.manuscriptsUserHasCurrentRoleIn}
      reviewerRespond={reviewerRespond}
      setReadyToEvaluateLabels={setReadyToEvaluateLabels}
      submissionForm={data.formForPurposeAndCategory}
      unsetCustomStatus={unsetCustomStatus}
      updateReviewerStatus={updateReviewerStatus}
      uriQueryParams={uriQueryParams}
    />
  ) : null
}

export default DashboardReviewsPage

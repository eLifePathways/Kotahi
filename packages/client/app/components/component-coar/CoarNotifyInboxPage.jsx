import { useMutation, useQuery } from '@apollo/client/react'
import { useContext } from 'react'
import { useLocation } from 'react-router'
import {
  GET_PAGINATED_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE,
  RESEND_COAR_NOTIFY_PAYLOAD,
} from '../../queries/coar.queries'
import CoarNotifyInbox from './CoarNotifyInbox'
import { ConfigContext } from '../config/src'
import {
  extractFilters,
  URI_PAGENUM_PARAM,
  URI_SEARCH_PARAM,
  useQueryParams,
} from '../../shared/urlParamUtils'

const CoarNotifyInboxPage = () => {
  const config = useContext(ConfigContext)
  const location = useLocation()
  const applyQueryParams = useQueryParams()

  const groupId = config?.groupId

  const uriQueryParams = new URLSearchParams(location.search)
  const page = uriQueryParams.get(URI_PAGENUM_PARAM) || 1
  const filters = extractFilters(uriQueryParams)
  const limit = config?.manuscript?.paginationCount || 10
  const currentSearchQuery = uriQueryParams.get(URI_SEARCH_PARAM)

  const { data, error, loading, refetch } = useQuery(
    GET_PAGINATED_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE,
    {
      fetchPolicy: 'network-only',
      variables: { filters, groupId, limit, offset: (page - 1) * limit },
    },
  )

  const [resendCoarNotifyPayload] = useMutation(RESEND_COAR_NOTIFY_PAYLOAD)

  if (error) {
    return 'error'
  }

  const { messages, totalCount } =
    data?.paginatedCoarNotificationsForGroupOrNone || {
      messages: [],
      totalCount: 0,
    }

  const handleResendCoarNotifyPayload = async ({
    id: notificationId,
    payload,
  }) => {
    const { data: resendData, errors: resendErrors } =
      await resendCoarNotifyPayload({
        variables: { groupId, notificationId, payload },
      })

    if (resendErrors) {
      return { reason: resendErrors[0].message, success: false }
    }

    refetch()

    return resendData.resendCoarNotifyPayload
  }

  return (
    <CoarNotifyInbox
      applyQueryParams={applyQueryParams}
      config={config}
      currentSearchPage={page}
      currentSearchQuery={currentSearchQuery}
      loading={loading}
      messageLimit={limit}
      messages={messages}
      onResendCoarNotifyPayload={handleResendCoarNotifyPayload}
      totalMessageCount={totalCount}
    />
  )
}

export default CoarNotifyInboxPage

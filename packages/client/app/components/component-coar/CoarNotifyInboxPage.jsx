import { useMutation, useQuery } from '@apollo/client/react'
import { useContext } from 'react'
import {
  GET_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE,
  RESEND_COAR_NOTIFY_PAYLOAD,
} from '../../queries/coar.queries'
import CoarNotifyInbox from './CoarNotifyInbox'
import { ConfigContext } from '../config/src'

const CoarNotifyInboxPage = () => {
  const config = useContext(ConfigContext)

  const groupId = config?.groupId

  const { data, error, loading, refetch } = useQuery(
    GET_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE,
    { variables: { groupId } },
  )

  const [resendCoarNotifyPayload] = useMutation(RESEND_COAR_NOTIFY_PAYLOAD)

  if (error) {
    return 'error'
  }

  const messages = data?.coarNotificationsForGroupOrNone || []

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
      config={config}
      loading={loading}
      messages={messages}
      onResendCoarNotifyPayload={handleResendCoarNotifyPayload}
    />
  )
}

export default CoarNotifyInboxPage

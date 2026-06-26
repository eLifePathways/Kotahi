import gql from 'graphql-tag'

// eslint-disable-next-line import/prefer-default-export
export const GET_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE = gql`
  query GetCoarNotificationsForGroupOrNone($groupId: ID!) {
    coarNotificationsForGroupOrNone(groupId: $groupId) {
      id
      manuscriptId
      payload
      groupId
      created
      manuscript {
        id
        status
      }
    }
  }
`

export const RESEND_COAR_NOTIFY_PAYLOAD = gql`
  mutation ResendCoarNotifyPayload(
    $groupId: ID!
    $notificationId: ID!
    $payload: String!
  ) {
    resendCoarNotifyPayload(
      groupId: $groupId
      notificationId: $notificationId
      payload: $payload
    ) {
      success
      reason
    }
  }
`

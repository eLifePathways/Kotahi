import { gql } from '@apollo/client'

export const GET_PAGINATED_COAR_NOTIFICATIONS_BY_GROUP_ID_OR_NONE = gql`
  query GetPaginatedCoarNotificationsForGroupOrNone(
    $filters: [ManuscriptsFilter!]!
    $groupId: ID!
    $limit: Int
    $offset: Int
  ) {
    paginatedCoarNotificationsForGroupOrNone(
      filters: $filters
      groupId: $groupId
      limit: $limit
      offset: $offset
    ) {
      messages {
        id
        manuscriptId
        payload
        groupId
        created
        manuscript {
          id
          status
          submission
        }
      }
      totalCount
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

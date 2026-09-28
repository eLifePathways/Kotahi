import { gql } from '@apollo/client'

export const GET_DASHBOARD_DATA = gql`
  query GetDashboardData {
    dashboardData {
      actionCardData {
        id
        type
        bucket
        manuscriptId
        shortId
        title
      }
      submissionsData {
        totalCount
      }
      reviewData {
        totalCount
      }
      editingQueueData {
        totalCount
      }
    }
  }
`

export const GET_USER_NOTIFICATIONS = gql`
  query GetUserNotifications {
    userNotifications {
      id
      manuscriptId
      eventType
      data
      created
    }
  }
`

export const DISMISS_USER_NOTIFICATION = gql`
  mutation DismissUserNotification($id: ID!) {
    dismissUserNotification(id: $id)
  }
`

export const DISMISS_ALL_USER_NOTIFICATIONS = gql`
  mutation DismissAllUserNotifications {
    dismissAllUserNotifications
  }
`

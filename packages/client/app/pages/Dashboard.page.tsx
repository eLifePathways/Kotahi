import { type ReactNode, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'

import {
  GET_DASHBOARD_DATA,
  GET_USER_NOTIFICATIONS,
  DISMISS_USER_NOTIFICATION,
  DISMISS_ALL_USER_NOTIFICATIONS,
} from '../queries'

import { useCurrentUser } from './hooks/useCurrentUser'
import Dashboard from '../ui/pages/dashboard/Dashboard'

const NOTIFICATIONS_POLL_INTERVAL =
  process.env.NODE_ENV === 'production' ? 30000 : 1000

const BUCKET_PATHS: Record<string, string> = {
  submissions: 'submissions',
  review: 'reviews',
  editingQueue: 'edits',
}

const ACTION_TYPE_MANUSCRIPT_PATHS: Record<string, string> = {
  authorSubmit: 'submit',
  authorRevise: 'submit',
  authorSubmitRevision: 'submit',
  // reviewerRespond - special case: see actionCardHref
  reviewerSubmit: 'review',
  editorDecide: 'decision',
  taskOverdue: 'manuscript',
  taskAlmostOverdue: 'manuscript',
}

const NOTIFICATION_EVENT_TYPE_PATHS: Record<string, string> = {
  addedAsEditor: 'decision',
  addedAsHandlingEditor: 'decision',
  addedAsSeniorEditor: 'decision',
  reviewerAcceptedInvitation: 'decision',
  reviewerCompletedReview: 'decision',
  reviewerRejectedInvitation: 'decision',
  revisionSubmitted: 'decision',
  addedAsReviewer: 'review',
  decisionMade: 'submit',
}

const DashboardPage = (): ReactNode => {
  const { groupName } = useParams()
  // @ts-ignore
  const { username } = useCurrentUser()

  const {
    loading: dashboardLoading,
    error: dashboardError,
    data: dashboardResult,
  } = useQuery(GET_DASHBOARD_DATA, {
    fetchPolicy: 'network-only',
  })

  const {
    loading: notificationsLoading,
    error: notificationsError,
    data: notificationsResult,
  } = useQuery(GET_USER_NOTIFICATIONS, {
    pollInterval: NOTIFICATIONS_POLL_INTERVAL,
  })

  const [dismissUserNotification] = useMutation(DISMISS_USER_NOTIFICATION, {
    refetchQueries: [{ query: GET_USER_NOTIFICATIONS }],
  })

  const [dismissAllUserNotifications] = useMutation(
    DISMISS_ALL_USER_NOTIFICATIONS,
    {
      refetchQueries: [{ query: GET_USER_NOTIFICATIONS }],
    },
  )

  const handleDismissNotification = useCallback(
    (id: string): void => {
      dismissUserNotification({ variables: { id } })
    },
    [dismissUserNotification],
  )

  const handleDismissAllNotifications = useCallback((): void => {
    dismissAllUserNotifications()
  }, [dismissAllUserNotifications])

  // @ts-ignore
  const dashboardData = dashboardResult?.dashboardData
  // @ts-ignore
  const userNotifications = notificationsResult?.userNotifications

  // only true for the initial load - not for the background poll/refetch
  const notificationsFirstLoad = notificationsLoading && !notificationsResult

  const dashboardPath = (bucket: string): string =>
    `/${groupName}/dashboard/${BUCKET_PATHS[bucket]}`

  const actionCardHref = (type: string, manuscriptId: string): string =>
    type === 'reviewerRespond'
      ? `${dashboardPath('review')}?reviewerStatusBadge=invited`
      : `/${groupName}/versions/${manuscriptId}/${ACTION_TYPE_MANUSCRIPT_PATHS[type]}`

  const attentionCountForBucket = (bucket: string): number =>
    dashboardData?.actionCardData.filter(item => item.bucket === bucket)
      .length ?? 0

  const actionCardData =
    dashboardData?.actionCardData.map(item => ({
      id: item.id,
      type: item.type,
      shortId: item.shortId,
      title: item.title,
      href: actionCardHref(item.type, item.manuscriptId),
    })) ?? []

  const notifications =
    userNotifications?.map(notification => {
      const { shortId } = JSON.parse(notification.data)
      const path = NOTIFICATION_EVENT_TYPE_PATHS[notification.eventType]

      let href: string

      if (path && notification.manuscriptId) {
        href = `/${groupName}/versions/${notification.manuscriptId}/${path}`
      }

      return {
        id: notification.id,
        shortId,
        eventType: notification.eventType,
        created: notification.created,
        href,
      }
    }) ?? []

  return (
    <Dashboard
      actionCardData={actionCardData}
      editingQueueData={{
        totalCount: dashboardData?.editingQueueData.totalCount ?? 0,
        attentionCount: attentionCountForBucket('editingQueue'),
        href: dashboardPath('editingQueue'),
      }}
      error={dashboardError}
      loading={dashboardLoading}
      notifications={notifications}
      notificationsError={notificationsError}
      notificationsLoading={notificationsFirstLoad}
      onDismissAllNotifications={handleDismissAllNotifications}
      onDismissNotification={handleDismissNotification}
      reviewData={{
        totalCount: dashboardData?.reviewData.totalCount ?? 0,
        attentionCount: attentionCountForBucket('review'),
        href: dashboardPath('review'),
      }}
      submissionsData={{
        totalCount: dashboardData?.submissionsData.totalCount ?? 0,
        attentionCount: attentionCountForBucket('submissions'),
        href: dashboardPath('submissions'),
      }}
      userName={username}
    />
  )
}

export default DashboardPage

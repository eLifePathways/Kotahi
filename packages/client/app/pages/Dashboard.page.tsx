import { type ReactNode, useCallback } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'

import {
  GET_DASHBOARD_DATA,
  GET_USER_NOTIFICATIONS,
  DISMISS_USER_NOTIFICATION,
  DISMISS_ALL_USER_NOTIFICATIONS,
} from '../queries'

import { useCurrentUser } from './hooks/useCurrentUser'
import Dashboard from '../ui/pages/dashboard/Dashboard'

const NOTIFICATIONS_POLL_INTERVAL = import.meta.env.PROD ? 30000 : 1000

const NOTIFICATIONS_LIMIT = 30

const notificationsQuery = {
  query: GET_USER_NOTIFICATIONS,
  variables: { limit: NOTIFICATIONS_LIMIT },
}

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
  // taskOverdue/taskAlmostOverdue - special case: see actionCardHref. These
  // can land in any bucket, so they route by bucket instead of by type.
}

const BUCKET_MANUSCRIPT_PATHS: Record<string, string> = {
  submissions: 'submit',
  review: 'review',
  editingQueue: 'decision',
}

const TASK_ACTION_TYPES = ['taskOverdue', 'taskAlmostOverdue']

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
    variables: notificationsQuery.variables,
    pollInterval: NOTIFICATIONS_POLL_INTERVAL,
  })

  const [dismissUserNotification] = useMutation(DISMISS_USER_NOTIFICATION, {
    refetchQueries: [notificationsQuery],
  })

  const [dismissAllUserNotifications] = useMutation(
    DISMISS_ALL_USER_NOTIFICATIONS,
    {
      refetchQueries: [notificationsQuery],
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

  // AcceptArticleOwnershipPage/DeclineArticleOwnershipPage stash a pending
  // invitation in localStorage and send a logged-out user to /login;
  // config.dashboard.loginRedirectUrl (usually here) sends them back
  // afterwards, so this is where that invitation gets picked back up and
  // actually completed
  const invitationId = localStorage.getItem('invitationId')

  if (invitationId) {
    const inviteAction = localStorage.getItem('inviteAction')

    const redirectPath =
      inviteAction === 'decline'
        ? `/${groupName}/decline/${invitationId}`
        : `/${groupName}/invitation/accepted`

    return <Navigate replace to={redirectPath} />
  }

  // @ts-ignore
  const dashboardData = dashboardResult?.dashboardData
  const userNotifications =
    // @ts-ignore
    notificationsResult?.userNotifications?.notifications

  const notificationsTotalCount =
    // @ts-ignore
    notificationsResult?.userNotifications?.totalCount ?? 0

  // only true for the initial load - not for the background poll/refetch
  const notificationsFirstLoad = notificationsLoading && !notificationsResult

  const dashboardPath = (bucket: string): string =>
    `/${groupName}/dashboard/${BUCKET_PATHS[bucket]}`

  const actionCardHref = (
    type: string,
    manuscriptId: string,
    bucket: string,
  ): string => {
    if (type === 'reviewerRespond') {
      return `${dashboardPath('review')}?reviewerStatusBadge=invited`
    }

    const path = TASK_ACTION_TYPES.includes(type)
      ? BUCKET_MANUSCRIPT_PATHS[bucket]
      : ACTION_TYPE_MANUSCRIPT_PATHS[type]

    return `/${groupName}/versions/${manuscriptId}/${path}`
  }

  const attentionCountForBucket = (bucket: string): number =>
    dashboardData?.actionCardData.filter(item => item.bucket === bucket)
      .length ?? 0

  const actionCardData =
    dashboardData?.actionCardData.map(item => ({
      id: item.id,
      type: item.type,
      shortId: item.shortId,
      title: item.title,
      href: actionCardHref(item.type, item.manuscriptId, item.bucket),
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

  const submissionsData = dashboardData?.submissionsData
    ? {
        totalCount: dashboardData.submissionsData.totalCount,
        attentionCount: attentionCountForBucket('submissions'),
        href: dashboardPath('submissions'),
      }
    : undefined

  const reviewData = dashboardData?.reviewData
    ? {
        totalCount: dashboardData.reviewData.totalCount,
        attentionCount: attentionCountForBucket('review'),
        href: dashboardPath('review'),
      }
    : undefined

  const editingQueueData = dashboardData?.editingQueueData
    ? {
        totalCount: dashboardData.editingQueueData.totalCount,
        attentionCount: attentionCountForBucket('editingQueue'),
        href: dashboardPath('editingQueue'),
      }
    : undefined

  return (
    <Dashboard
      actionCardData={actionCardData}
      editingQueueData={editingQueueData}
      error={dashboardError}
      loading={dashboardLoading}
      notifications={notifications}
      notificationsError={notificationsError}
      notificationsLoading={notificationsFirstLoad}
      notificationsTotalCount={notificationsTotalCount}
      onDismissAllNotifications={handleDismissAllNotifications}
      onDismissNotification={handleDismissNotification}
      reviewData={reviewData}
      submissionsData={submissionsData}
      userName={username}
    />
  )
}

export default DashboardPage

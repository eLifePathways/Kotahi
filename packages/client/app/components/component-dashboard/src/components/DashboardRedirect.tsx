import { type ReactNode } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'

import { CURRENT_USER } from '../../../../queries'

const DashboardRedirect = (): ReactNode => {
  const { groupName } = useParams()

  const { data: currentUserData } = useQuery(CURRENT_USER)
  // @ts-ignore
  const currentUser = currentUserData.currentUser

  const invitationId = window.localStorage.getItem('invitationId') || ''
  const inviteAction = window.localStorage.getItem('inviteAction') || ''

  const dashboardSubmissionsLink = `/${groupName}/dashboard/submissions`

  const dashboardRedirectUrl = currentUser?.recentTab
    ? `/${groupName}/dashboard/${currentUser.recentTab}`
    : dashboardSubmissionsLink

  if (invitationId) {
    return (
      <Navigate
        replace
        to={`/${groupName}/${
          inviteAction === 'decline'
            ? 'decline/'.concat(invitationId)
            : 'invitation/accepted'
        }`}
      />
    )
  }

  return <Navigate replace to={dashboardRedirectUrl} />
}

export default DashboardRedirect

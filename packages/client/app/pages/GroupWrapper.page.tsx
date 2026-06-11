import { type ReactNode } from 'react'
import { useParams, Outlet } from 'react-router-dom'
import { useQuery } from '@apollo/client/react'

import { GET_GROUPS } from '../queries'

const GroupWrapper = (): ReactNode => {
  const { groupName } = useParams()

  /**
   * TO DO
   * The get group query fetches a lot of data for all groups in the cache.
   * Fetch something more minimal to grab the names(same goes for the login
   * dropdown) and get the full single group afterwards.
   */

  const { loading, error, data } = useQuery(GET_GROUPS)

  // TO DO - show spinner
  if (loading) return null

  if (error) {
    // TO DO - show nicer message
    return `Something went wrong`
  }

  // @ts-ignore
  const currentGroup = data.groups.find(group => group.name === groupName)

  if (!currentGroup) {
    // TO DO - show nicer message
    return `No group named ${groupName}`
  }

  return <Outlet />
}

export default GroupWrapper

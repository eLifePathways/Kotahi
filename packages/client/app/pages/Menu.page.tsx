import { type ReactNode, useContext } from 'react'

import { ConfigContext } from '../components/config/src'
import { useCurrentUser } from './hooks/useCurrentUser'

import Menu from '../ui/base/Menu'

const MenuPage = (): ReactNode => {
  const menuCollapsed = localStorage.getItem('menuCollapsed') === 'true'

  const updateMenuCollapsed = (collapsed: boolean): void => {
    localStorage.setItem('menuCollapsed', String(collapsed))
  }

  const config = useContext(ConfigContext)
  const user = useCurrentUser()

  // @ts-ignore
  const { groupRoles, globalRoles, username, profilePicture } = user

  const isUserGroupAdmin = groupRoles.includes('groupAdmin')
  const isUserGroupManager = groupRoles.includes('groupManager')
  const isUserAdmin = globalRoles.includes('admin')

  // @ts-ignore
  const { instanceName, groupIdentity, report } = config

  const showDashboard = ['journal', 'prc', 'preprint2'].includes(instanceName)

  return (
    <Menu
      groupDisplayName={groupIdentity.brandName}
      groupType={instanceName}
      initialMenuCollapsed={menuCollapsed}
      isUserAdmin={isUserAdmin}
      isUserGroupAdmin={isUserGroupAdmin}
      isUserGroupManager={isUserGroupManager}
      onMenuCollapseChange={updateMenuCollapsed}
      showDashboard={showDashboard}
      showReports={report.showInMenu}
      userDisplayName={username}
      userProfileImage={profilePicture}
    />
  )
}

export default MenuPage

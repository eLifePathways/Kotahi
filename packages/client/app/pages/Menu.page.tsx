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
  const isPrivilegedUser = isUserAdmin || isUserGroupAdmin || isUserGroupManager

  // @ts-ignore
  const { instanceName, groupIdentity, report, controlPanel } = config

  const instances = {
    journal: 'Journal',
    prc: 'PRC',
    preprint1: 'Preprint 1',
    preprint2: 'Preprint 2',
  }

  const showDashboard = ['journal', 'prc', 'preprint2'].includes(instanceName)
  const showCoar = controlPanel?.showTabs.includes('COAR Notify Metadata')
  const showNewSubmissionButton =
    (instanceName === 'preprint1' && isPrivilegedUser) || showDashboard

  return (
    <Menu
      groupDisplayName={groupIdentity.brandName}
      groupType={instances[instanceName] ?? instanceName}
      initialMenuCollapsed={menuCollapsed}
      isUserAdmin={isUserAdmin}
      isUserGroupAdmin={isUserGroupAdmin}
      isUserGroupManager={isUserGroupManager}
      onMenuCollapseChange={updateMenuCollapsed}
      showCoar={showCoar}
      showDashboard={showDashboard}
      showNewSubmissionButton={showNewSubmissionButton}
      showReports={report.showInMenu}
      userDisplayName={username}
      userProfileImage={profilePicture}
    />
  )
}

export default MenuPage

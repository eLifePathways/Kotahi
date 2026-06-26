import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import styled, { css, RuleSet } from 'styled-components'
import { grid, th, Link } from '@coko/client'
import {
  HomeOutlined,
  FileTextOutlined,
  BarChartOutlined,
  FormOutlined,
  UnorderedListOutlined,
  UserOutlined,
  ControlOutlined,
  ReadOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons'

import Avatar from '../shared/Avatar'

// #region styled
const fullWidth = '250px'
const collapsedWidth = '64px'
const collapseTime = '0.3s'
const collapseTransition = `${collapseTime} ease`

const Wrapper = styled.div<{ $menuCollapsed: boolean }>`
  background-color: ${th('colorPrimary')};
  color: ${th('colorTextReverse')};

  height: 100%;
  width: ${(props): string =>
    props.$menuCollapsed ? collapsedWidth : fullWidth};
  transition: width ${collapseTransition};

  padding: ${grid(1)} 0;

  display: flex;
  flex-direction: column;
  overflow: hidden;
`

const GroupSection = styled.div`
  margin: ${grid(1)} ${grid(1)} 0 ${grid(1)};
  display: flex;
  align-items: center;
`

const GroupLetter = styled.div<{ $menuCollapsed: boolean }>`
  height: ${grid(6)};
  width: ${grid(6)};
  border-radius: ${th('borderRadiusLarge')};

  background-color: ${th('colorBackground')};
  color: ${th('colorPrimary')};
  font-size: 1.5rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  margin-left: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(1)(props)};
  margin-right: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(1.5)(props)};
  transition: margin ${collapseTransition};
`

const GroupRight = styled.div<{ $menuCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${grid(0.75)};

  visibility: ${(props): string =>
    props.$menuCollapsed ? 'hidden' : 'visible'};
  opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
  height: ${(props): string => (props.$menuCollapsed ? '0' : 'auto')};
`

const GroupName = styled.div<{ $labelsWrap: boolean }>`
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
  vertical-align: center;
  white-space: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
`

const GroupType = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
`

const Separator = styled.div`
  height: 1px;
  /* background-color: ${th('colorBackground')}; */
  margin: ${grid(2)} ${grid(0.5)};
  border-top: 1.5px solid ${th('colorBackground')};
`

const LinkSection = styled.div`
  padding: 0 ${grid(1)};
  user-select: none;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const LinkItems = styled.div`
  flex-grow: 1;
`

const hoverFade = '0.3s ease'

const active = css`
  background-color: white;
  color: ${th('colorText')};
`

const LinkItem = styled.div<{ $active: boolean }>`
  color: ${th('colorTextReverse')};
  cursor: pointer;
  margin-bottom: ${grid(0.5)};
  padding: ${grid(1)} ${grid(2)};
  display: flex;

  transition:
    background-color ${hoverFade},
    color ${hoverFade};

  > div:first-child {
    flex-shrink: 0;
    margin-right: ${grid(1)};
  }

  &:hover {
    ${active}
  }

  ${(props): RuleSet | false => props.$active && active};
`

const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${grid(1)} ${grid(1)} ${grid(1)};
`

const UserTop = styled.div<{ $menuCollapsed: boolean }>`
  display: flex;
  align-items: center;

  margin-left: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(1)(props)};
  margin-right: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(1.5)(props)};
  margin-bottom: ${grid(1)};
  transition: margin ${collapseTransition};

  > a {
    flex-grow: 1;
    display: flex;
    align-items: center;

    > div:first-child {
      flex-shrink: 0;
      margin-right: ${grid(1)};
    }

    > div:last-child {
      visibility: ${(props): string =>
        props.$menuCollapsed ? 'hidden' : 'visible'};
      opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
    }
  }
`

const UserBottom = styled.div<{ $menuCollapsed: boolean }>`
  margin-left: ${grid(1)};

  visibility: ${(props): string =>
    props.$menuCollapsed ? 'hidden' : 'visible'};
  opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
  height: ${(props): string => (props.$menuCollapsed ? '0' : 'auto')};
`

const UserName = styled.div<{ $labelsWrap: boolean }>`
  color: ${th('colorTextReverse')};
  font-weight: 500;
  flex-grow: 1;
  white-space: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
`

const UserRoles = styled.div<{ $labelsWrap: boolean }>`
  display: flex;
  gap: ${grid(0.5)};
  flex-wrap: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
  overflow: hidden;
`

const UserLabel = styled.span`
  background-color: ${th('colorTextReverse')};
  color: ${th('colorPrimary')};
  font-size: ${th('fontSizeBaseSmaller')};
  padding: 0 ${grid(1)};
  border-radius: 3px;
  white-space: nowrap;
`

const CollapseIconWrapper = css`
  align-self: center;
  color: ${th('colorTextReverse')};

  opacity: 1;
  visibility: visible;
  transition:
    opacity ${collapseTransition},
    visibility ${collapseTransition};

  > span[role='img'] {
    font-size: 1.4rem;
    cursor: pointer;
    transition: font-size ${collapseTransition};

    &:hover {
      font-size: 1.7rem;
    }
  }
`

const UserCollapseIconWrapper = styled.div<{ $menuCollapsed: boolean }>`
  ${CollapseIconWrapper};

  ${(props): RuleSet =>
    props.$menuCollapsed &&
    css`
      opacity: 0;
      visibility: hidden;
    `}

  > span[role='img'] {
    transform: rotate(270deg);
  }
`

const LinksCollapseIconWrapper = styled.div<{ $menuCollapsed: boolean }>`
  ${CollapseIconWrapper};

  ${(props): RuleSet =>
    !props.$menuCollapsed &&
    css`
      opacity: 0;
      visibility: hidden;
    `}

  > span[role='img'] {
    transform: rotate(90deg);
  }
`
// #endregion styled

// #region types
type LinkRow = {
  label: string
  url: string
  icon?: ReactNode
  key: string
}

type LinkArray = LinkRow[]

type MenuProps = {
  /** The group display name as defined in the configuration settings. */
  groupDisplayName: string
  /** The type of the group (eg. journal, prc etc) */
  groupType: string
  isUserAdmin: boolean
  isUserGroupAdmin: boolean
  isUserGroupManager: boolean
  userGivenNames: string
  userSurname: string
  userProfileImage?: string
  /** Whether to start the menu from collapsed state (eg. stored value in localstorage) */
  initialMenuCollapsed: boolean
  /** Store latest menu collapse state (eg. store value in localstorage) */
  onMenuCollapseChange: (isCollapsed: boolean) => void

  showDashboard: boolean
  showReports: boolean
}
// #endregion types

/**
 * roles
 * collapse
 */

const Menu = (props: MenuProps): ReactNode => {
  const {
    groupDisplayName,
    groupType,
    isUserAdmin,
    isUserGroupAdmin,
    isUserGroupManager,
    userGivenNames,
    userSurname,
    userProfileImage,
    initialMenuCollapsed,
    onMenuCollapseChange,
    showDashboard,
    showReports,
  } = props
  const { pathname } = useLocation()
  const { groupName } = useParams()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const [menuCollapsed, setMenuCollapsed] = useState(initialMenuCollapsed)
  const [labelsWrap, setLabelsWrap] = useState(!initialMenuCollapsed)

  const toggleMenuCollapsed = (): void => {
    const newCollapsed = !menuCollapsed
    setMenuCollapsed(newCollapsed)
    onMenuCollapseChange(newCollapsed)
    if (newCollapsed) setLabelsWrap(false)
  }

  /**
   * This (and the ref) exist as a compromise. When the user has enough user
   * labels, we need to wrap the labels into a second line. But keeping wrap
   * on the labels caused the menu animation to glitch (making the user avatar
   * go up then down while the wrap was being automatically adjusted). What we
   * do here is remove wrap from the labels when collapsing the menu and then
   * reinstating it only when the menu expansion transition is complete.
   *
   * Try the many roles story to see it adjust after the menu completely expands.
   *
   * This is a bit of an edge case, as the user is unlikely to have that many
   * roles, but still worth taking care of for future-proofing (eg. if we add
   * more roles).
   *
   * Same thing is applied to names if they are long enough. See the long names
   * story.
   */
  useEffect(() => {
    const wrapper = wrapperRef.current
    const onTransitionEnd = (e: TransitionEvent): void => {
      if (e.propertyName === 'width' && !menuCollapsed) setLabelsWrap(true)
    }
    wrapper.addEventListener('transitionend', onTransitionEnd)
    return (): void => {
      wrapper.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [menuCollapsed])

  const links: LinkArray = useMemo(() => {
    return [
      {
        label: 'Dashboard',
        url: `/${groupName}/dashboard`,
        icon: <HomeOutlined />,
        key: 'dashboard',
        show: showDashboard,
      },
      {
        label: 'Manuscripts',
        url: `/${groupName}/admin/manuscripts`,
        icon: <FileTextOutlined />,
        key: 'manuscripts',
        show: isUserGroupAdmin || isUserGroupManager || isUserAdmin,
      },
      {
        label: 'Reports',
        url: `/${groupName}/admin/reports`,
        icon: <BarChartOutlined />,
        key: 'reports',
        show: showReports && (isUserGroupAdmin || isUserAdmin),
      },
      {
        label: 'Forms',
        url: `/${groupName}/admin/forms`,
        icon: <FormOutlined />,
        key: 'forms',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: 'Tasks',
        url: `/${groupName}/admin/tasks`,
        icon: <UnorderedListOutlined />,
        key: 'tasks',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: 'Users',
        url: `/${groupName}/admin/users`,
        icon: <UserOutlined />,
        key: 'users',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: 'Configuration',
        url: `/${groupName}/admin/configuration`,
        icon: <ControlOutlined />,
        key: 'configuration',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: 'CMS',
        url: `/${groupName}/admin/cms`,
        icon: <ReadOutlined />,
        key: 'cms',
        show: isUserGroupAdmin || isUserAdmin,
      },
    ].filter(item => item.show)
  }, [
    groupName,
    showDashboard,
    showReports,
    isUserAdmin,
    isUserGroupAdmin,
    isUserGroupManager,
  ])

  return (
    <Wrapper $menuCollapsed={menuCollapsed} ref={wrapperRef}>
      <GroupSection>
        <GroupLetter $menuCollapsed={menuCollapsed}>
          {groupDisplayName.slice(0, 1)}
        </GroupLetter>
        <GroupRight $menuCollapsed={menuCollapsed}>
          <GroupName $labelsWrap={labelsWrap}>{groupDisplayName}</GroupName>
          <GroupType>{groupType}</GroupType>
        </GroupRight>
      </GroupSection>

      <Separator />

      <LinkSection>
        <LinkItems>
          {links.map(item => {
            return (
              <Link key={item.key} to={item.url}>
                <LinkItem $active={pathname === item.url}>
                  <div>{item.icon}</div>
                  {!menuCollapsed && <div>{item.label}</div>}
                </LinkItem>
              </Link>
            )
          })}
        </LinkItems>

        <LinksCollapseIconWrapper $menuCollapsed={menuCollapsed}>
          <VerticalAlignTopOutlined onClick={toggleMenuCollapsed} />
        </LinksCollapseIconWrapper>
      </LinkSection>

      <Separator />

      <UserSection>
        <UserTop $menuCollapsed={menuCollapsed}>
          <Link to="/profile">
            <Avatar src={userProfileImage} />
            <UserName $labelsWrap={labelsWrap}>
              {userGivenNames} {userSurname}
            </UserName>
          </Link>

          <UserCollapseIconWrapper $menuCollapsed={menuCollapsed}>
            <VerticalAlignTopOutlined onClick={toggleMenuCollapsed} />
          </UserCollapseIconWrapper>
        </UserTop>
        <UserBottom $menuCollapsed={menuCollapsed}>
          <UserRoles $labelsWrap={labelsWrap}>
            {isUserAdmin && <UserLabel>Admin</UserLabel>}
            {isUserGroupAdmin && <UserLabel>Group Admin</UserLabel>}
            {isUserGroupManager && <UserLabel>Group Manager</UserLabel>}
          </UserRoles>
        </UserBottom>
      </UserSection>
    </Wrapper>
  )
}

export default Menu

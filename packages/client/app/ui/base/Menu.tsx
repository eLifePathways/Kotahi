import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styled, { css, RuleSet } from 'styled-components'
import { grid, th, Link as UILink } from '@coko/client'

import Avatar from '../shared/Avatar'
import Badge from '../shared/Badge'
import {
  Home,
  File,
  Report,
  Form,
  Tasks,
  User,
  Settings,
  ExpandMenu,
  Book,
  Coar,
} from './Icons'

// #region styled
const fullWidth = '272px'
const collapsedWidth = '64px'
const collapseTime = '0.3s'
const collapseTransition = `${collapseTime} ease`

/**
 * If you notice redundant font-family, font-size and line-height values all
 * over this file, it's because bootstrap's (!) css is interfering when it's
 * loaded. Once bootstrap has been cleared out from the client, these can be
 * removed.
 */

const Wrapper = styled.nav<{ $menuCollapsed: boolean }>`
  background-color: ${th('colorPrimary')};
  color: ${th('colorTextReverse')};

  height: 100%;
  width: ${(props): string =>
    props.$menuCollapsed ? collapsedWidth : fullWidth};
  flex-shrink: 0;
  transition: width ${collapseTransition};
  will-change: width;

  padding: ${grid(2)} 0;

  display: flex;
  flex-direction: column;
  overflow: hidden;

  && a:focus {
    outline: 1px solid ${th('colorTextReverse')};
  }
`

const GroupSection = styled.div`
  margin: ${grid(2)} ${grid(2)} 0 ${grid(2)};
  display: flex;
  align-items: center;
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const GroupLetter = styled.div<{ $menuCollapsed: boolean }>`
  height: ${grid(12)};
  width: ${grid(12)};
  border-radius: ${th('borderRadiusLarge')};

  background-color: ${th('colorBackground')};
  color: ${th('colorPrimary')};
  font-size: 1.5rem;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  margin-left: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(2)(props)};
  margin-right: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(3)(props)};
  transition: margin ${collapseTransition};
`

const GroupRight = styled.div<{ $menuCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  padding-top: ${grid(1.5)};

  visibility: ${(props): string =>
    props.$menuCollapsed ? 'hidden' : 'visible'};
  opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
  height: ${(props): string => (props.$menuCollapsed ? '0' : 'auto')};
`

const GroupName = styled.div<{ $labelsWrap: boolean }>`
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeHeading5')};
  font-weight: 500;
  white-space: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
`

const GroupType = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  text-transform: capitalize;
`

const Separator = styled.div`
  height: 1px;
  /* background-color: ${th('colorBackground')}; */
  margin: ${grid(4)} ${grid(1)};
  border-top: 1.5px solid ${th('colorBackground')};
`

const LinkSection = styled.div`
  padding: 0 ${grid(2)};
  user-select: none;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const LinkItems = styled.ul`
  flex-grow: 1;
  list-style: none;
  padding: 0;
`

const hoverFade = '0.3s ease'

const active = css`
  background-color: ${th('colorTextReverse')};
  color: ${th('colorText')};
`

const LinkItem = styled.div<{ $active: boolean }>`
  color: ${th('colorTextReverse')};
  cursor: pointer;
  font-size: ${th('fontSizeBase')};
  margin-bottom: ${grid(1)};
  padding: ${grid(2)} ${grid(4)};
  display: flex;
  white-space: nowrap;

  transition:
    background-color ${hoverFade},
    color ${hoverFade};

  > div:first-child {
    flex-shrink: 0;
    margin-right: ${grid(2)};
  }

  &:hover {
    ${active}
  }

  ${(props): RuleSet | false => props.$active && active};
`

const Link = styled(UILink)`
  display: block;
`

const UserSection = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 ${grid(2)} ${grid(2)} ${grid(2)};
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const UserTop = styled.div<{ $menuCollapsed: boolean }>`
  display: flex;
  align-items: center;

  margin-left: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(2)(props)};
  margin-right: ${(props): string =>
    props.$menuCollapsed ? '0' : grid(3)(props)};
  margin-bottom: ${grid(2)};
  transition: margin ${collapseTransition};

  > a {
    flex-grow: 1;
    display: flex;
    align-items: center;

    > div:first-child {
      flex-shrink: 0;
      margin-right: ${grid(2)};
    }

    > div:last-child {
      visibility: ${(props): string =>
        props.$menuCollapsed ? 'hidden' : 'visible'};
      opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
    }
  }
`

const UserBottom = styled.div<{ $menuCollapsed: boolean }>`
  margin-left: ${grid(2)};

  visibility: ${(props): string =>
    props.$menuCollapsed ? 'hidden' : 'visible'};
  opacity: ${(props): string => (props.$menuCollapsed ? '0' : '1')};
  height: ${(props): string => (props.$menuCollapsed ? '0' : 'auto')};
`

const UserName = styled.div<{ $labelsWrap: boolean }>`
  color: ${th('colorTextReverse')};
  font-size: ${th('fontSizeBase')};
  font-weight: 500;
  flex-grow: 1;
  white-space: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
`

const UserRoles = styled.div<{ $labelsWrap: boolean }>`
  display: flex;
  gap: ${grid(1)};
  flex-wrap: ${(props): string => (props.$labelsWrap ? 'wrap' : 'nowrap')};
  overflow: hidden;
`

const UserLabel = styled(Badge)`
  background-color: ${th('colorTextReverse')};
  color: ${th('colorPrimary')};
`

const CollapseIconWrapper = css`
  align-self: center;
  background: none;
  border: none;
  color: ${th('colorTextReverse')};
  cursor: pointer;
  padding: 0;

  opacity: 1;
  visibility: visible;
  transition:
    opacity ${collapseTransition},
    visibility ${collapseTransition};

  &:focus-visible {
    outline: 1px solid ${th('colorTextReverse')};
  }

  > span[role='img'] {
    font-size: 1.4rem;
    transition: font-size ${collapseTransition};
  }

  &:hover > span[role='img'] {
    font-size: 1.7rem;
  }
`

const UserCollapseIconWrapper = styled.button<{ $menuCollapsed: boolean }>`
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

const LinksCollapseIconWrapper = styled.button<{ $menuCollapsed: boolean }>`
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
  userDisplayName: string
  userProfileImage?: string
  /** Whether to start the menu from collapsed state (eg. stored value in localstorage) */
  initialMenuCollapsed: boolean
  /** Store latest menu collapse state (eg. store value in localstorage) */
  onMenuCollapseChange: (isCollapsed: boolean) => void

  showCoar: boolean
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
    userDisplayName,
    userProfileImage,
    initialMenuCollapsed,
    onMenuCollapseChange,
    showCoar,
    showDashboard,
    showReports,
  } = props
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const { groupName } = useParams()
  const wrapperRef = useRef<HTMLElement>(null)
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
        label: t('menu.Dashboard'),
        url: `/${groupName}/dashboard`,
        icon: <Home aria-hidden />,
        key: 'dashboard',
        show: showDashboard,
      },
      {
        label: t('menu.Manuscripts'),
        url: `/${groupName}/admin/manuscripts`,
        icon: <File aria-hidden />,
        key: 'manuscripts',
        show: isUserGroupAdmin || isUserGroupManager || isUserAdmin,
      },
      {
        label: t('menu.Reports'),
        url: `/${groupName}/admin/reports`,
        icon: <Report aria-hidden />,
        key: 'reports',
        show: showReports && (isUserGroupAdmin || isUserAdmin),
      },
      {
        label: t('menu.CoarNotifyInbox'),
        url: `/${groupName}/admin/coar-inbox`,
        icon: <Coar aria-hidden />,
        key: 'coar',
        show:
          showCoar && (isUserGroupAdmin || isUserGroupManager || isUserAdmin),
      },
      {
        label: t('menu.Forms'),
        url: `/${groupName}/admin/forms`,
        icon: <Form aria-hidden />,
        key: 'forms',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: t('menu.Tasks'),
        url: `/${groupName}/admin/tasks`,
        icon: <Tasks aria-hidden />,
        key: 'tasks',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: t('menu.Users'),
        url: `/${groupName}/admin/users`,
        icon: <User aria-hidden />,
        key: 'users',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: t('menu.Configuration'),
        url: `/${groupName}/admin/configuration`,
        icon: <Settings aria-hidden />,
        key: 'configuration',
        show: isUserGroupAdmin || isUserAdmin,
      },
      {
        label: t('menu.CMS'),
        url: `/${groupName}/admin/cms`,
        icon: <Book aria-hidden />,
        key: 'cms',
        show: isUserGroupAdmin || isUserAdmin,
      },
    ].filter(item => item.show)
  }, [
    t,
    groupName,
    showCoar,
    showDashboard,
    showReports,
    isUserAdmin,
    isUserGroupAdmin,
    isUserGroupManager,
  ])

  return (
    <Wrapper
      $menuCollapsed={menuCollapsed}
      aria-label={t('menu.MainNavigation')}
      data-testid="menu-nav"
      ref={wrapperRef}
    >
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
            const isActive = !!pathname.match(item.url)

            return (
              <li key={item.key}>
                <Link
                  aria-current={isActive ? 'page' : undefined}
                  data-testid={`menu-link-${item.key}`}
                  to={item.url}
                >
                  <LinkItem $active={isActive}>
                    <div>{item.icon}</div>
                    {!menuCollapsed && <div>{item.label}</div>}
                  </LinkItem>
                </Link>
              </li>
            )
          })}
        </LinkItems>

        <LinksCollapseIconWrapper
          $menuCollapsed={menuCollapsed}
          aria-expanded={!menuCollapsed}
          aria-label={
            menuCollapsed ? t('menu.ExpandMenu') : t('menu.CollapseMenu')
          }
          onClick={toggleMenuCollapsed}
        >
          <ExpandMenu aria-hidden />
        </LinksCollapseIconWrapper>
      </LinkSection>

      <Separator />

      <UserSection data-testid="menu-user-section">
        <UserTop $menuCollapsed={menuCollapsed}>
          <Link data-testid="menu-user" to={`/${groupName}/profile`}>
            <Avatar src={userProfileImage} />
            <UserName $labelsWrap={labelsWrap}>{userDisplayName}</UserName>
          </Link>

          <UserCollapseIconWrapper
            $menuCollapsed={menuCollapsed}
            aria-expanded={!menuCollapsed}
            aria-label={
              menuCollapsed ? t('menu.ExpandMenu') : t('menu.CollapseMenu')
            }
            onClick={toggleMenuCollapsed}
          >
            <ExpandMenu aria-hidden />
          </UserCollapseIconWrapper>
        </UserTop>
        <UserBottom $menuCollapsed={menuCollapsed}>
          <UserRoles $labelsWrap={labelsWrap}>
            {isUserAdmin && (
              <UserLabel small>{t('common.roles.Admin')}</UserLabel>
            )}
            {isUserGroupAdmin && (
              <UserLabel small>{t('common.roles.Group Admin')}</UserLabel>
            )}
            {isUserGroupManager && (
              <UserLabel small>{t('common.roles.Group Manager')}</UserLabel>
            )}
          </UserRoles>
        </UserBottom>
      </UserSection>
    </Wrapper>
  )
}

export default Menu

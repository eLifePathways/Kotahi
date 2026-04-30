import { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { useMutation } from '@apollo/client'
import {
  NavItem,
  NavLinks,
  MainNavWrapper,
  SectionNavLayoutSettings,
  Root,
  ScrollWrapper,
  SubMenu,
  UserComponent,
  StyledPinButton,
} from './component-menu'
import mutations from './component-dashboard/src/graphql/mutations'

const Menu = ({
  className,
  loginLink = '/login',
  navLinkComponents,
  user,
  notice,
  profileLink,
}) => {
  const { t } = useTranslation()
  const [menuIsMinimal, setMenuIsMinimal] = useState(!user.menuPinned)
  const [menuPinned, setMenuPinned] = useState(!!user.menuPinned)
  const [updateMenuState] = useMutation(mutations.updateMenu)

  const renderLinks = useMemo(() => {
    return (
      navLinkComponents &&
      navLinkComponents.map(navInfo =>
        navInfo.menu ? (
          <SubMenu
            key={navInfo.name}
            menuIsMinimal={menuIsMinimal}
            setMenuIsMinimal={setMenuIsMinimal}
            {...navInfo}
          />
        ) : (
          <NavItem
            key={navInfo.link}
            menuIsMinimal={menuIsMinimal}
            {...navInfo}
          />
        ),
      )
    )
  }, [menuIsMinimal, navLinkComponents])

  const handlers = {
    pinNavbar: () => {
      updateMenuState({ variables: { expanded: !menuPinned } })
      setMenuPinned(!menuPinned)
    },
    mouseoverNav: () => {
      if (menuIsMinimal) {
        setMenuIsMinimal(false)
      }
    },
    mouseleaveNav: () => {
      if (!menuPinned) {
        setMenuIsMinimal(true)
      }
    },
    expandCollapse: () => {
      setMenuIsMinimal(!menuIsMinimal)
    },
  }

  return (
    <Root
      aria-expanded={!menuIsMinimal}
      className={className}
      data-testid="menu-container"
      onMouseLeave={handlers.mouseleaveNav}
    >
      <SectionNavLayoutSettings
        $pinned={menuPinned}
        onClick={handlers.pinNavbar}
        onMouseEnter={handlers.mouseoverNav}
        title={
          menuPinned
            ? t('menuSettings.MinimalSidebar')
            : t('menuSettings.KeepMenuVisible')
        }
        type="submit"
      >
        <StyledPinButton $menuIsMinimal={menuIsMinimal} $pinned={menuPinned} />
      </SectionNavLayoutSettings>
      {/* TODO: Place this notice (used for offline notification) better */}
      {notice}
      <MainNavWrapper>
        <UserComponent
          expanded={!menuIsMinimal}
          loginLink={loginLink}
          profileLink={profileLink}
          t={t}
          user={user}
        />
        <ScrollWrapper>
          <NavLinks>{renderLinks}</NavLinks>
        </ScrollWrapper>
      </MainNavWrapper>
    </Root>
  )
}

Menu.propTypes = {
  className: PropTypes.string.isRequired,
  loginLink: PropTypes.string.isRequired,
  navLinkComponents: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.oneOfType([PropTypes.object]),
  notice: PropTypes.node.isRequired,
  profileLink: PropTypes.string.isRequired,
}

Menu.defaultProps = {
  user: undefined,
}

export default Menu

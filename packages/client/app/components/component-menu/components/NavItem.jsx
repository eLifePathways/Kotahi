/* stylelint-disable declaration-no-important */

/* eslint-disable react/prop-types */

import { useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Icon } from '../../pubsweet'
import { AlertIndicator, LinkLabel, StyledIcon, StyledLink } from '../styles'

const MenuItem = ({ alert, icon, menu, name, open }) => (
  <span>
    {icon && <StyledIcon>{icon}</StyledIcon>}
    <LinkLabel>{name}</LinkLabel>
    {alert && <AlertIndicator />}
    {menu && <Icon>chevron-{open ? 'up' : 'down'}</Icon>}
  </span>
)

const NavItem = props => {
  const {
    className = '',
    link,
    onClick,
    alert,
    icon,
    menu,
    menuIsMinimal,
    name,
    open,
    depth,
  } = props

  const itemProps = { alert, icon, menu, name, open }
  const location = useLocation()

  return link ? (
    <StyledLink
      $active={location.pathname === link || location.pathname.includes(link)}
      className={className}
      data-testid={`menu-${name}`}
      depth={depth}
      onClick={onClick}
      title={menuIsMinimal ? name : null}
      to={link}
    >
      <MenuItem {...itemProps} />
    </StyledLink>
  ) : (
    <StyledLink
      as="div"
      className={className}
      data-testid={`menu-${name}`}
      depth={depth}
      onClick={onClick}
      submenu
      title={menuIsMinimal ? name : null}
    >
      <MenuItem {...itemProps} />
    </StyledLink>
  )
}

NavItem.propTypes = {
  className: PropTypes.string,
  link: PropTypes.string,
  name: PropTypes.string.isRequired,
  icon: PropTypes.string,
}

export default NavItem

/* eslint-disable react/prop-types */

import { useState, memo } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SubMenuContainer,
  SubMenuFirstLevelContainer,
  menuItemContainsCurrentPage,
} from '../styles'
import NavItem from './NavItem'

const SubMenu = ({
  depth = 0,
  menuIsMinimal,
  setMenuIsMinimal,
  ...navInfo
}) => {
  const location = useLocation()

  const [open, setOpen] = useState(
    menuItemContainsCurrentPage(navInfo, location),
  )

  const handleOpen = () => {
    setOpen(!open || menuIsMinimal)
    setMenuIsMinimal(false)
  }

  return (
    <SubMenuFirstLevelContainer depth={depth}>
      <NavItem
        active={location.pathname === navInfo.link}
        depth={depth}
        menuIsMinimal={menuIsMinimal}
        onClick={handleOpen}
        open={open}
        {...navInfo}
      />
      <SubMenuContainer aria-expanded={open} key={navInfo.name}>
        {navInfo.links.map(subNavInfo =>
          subNavInfo.menu ? (
            <SubMenu
              depth={depth + 1}
              key={subNavInfo.name}
              menuIsMinimal={menuIsMinimal}
              setMenuIsMinimal={setMenuIsMinimal}
              {...subNavInfo}
            />
          ) : (
            <NavItem
              active={location.pathname === subNavInfo.link}
              depth={depth + 1}
              key={subNavInfo.link}
              menuIsMinimal={menuIsMinimal}
              {...subNavInfo}
            />
          ),
        )}
      </SubMenuContainer>
    </SubMenuFirstLevelContainer>
  )
}

export default memo(SubMenu)

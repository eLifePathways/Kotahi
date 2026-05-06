/* eslint-disable react/prop-types */

import { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { override, th } from '@coko/client'

import UIButton from './Button'
import UIIcon from './Icon'

const Icon = styled(UIIcon)`
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  height: ${th('fontSizeBase')};
  vertical-align: top;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Button.Icon')}
`

const ChevronIcon = styled(Icon)`
  float: right;
`

const StyledDropdown = styled.div`
  display: inline-block;
  margin: 0;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Dropdown.Wrapper')}
`

const DropdownTitle = styled(UIButton)`
  color: ${props => props.color};
  cursor: pointer;
  display: inline-block;
  padding: ${props => (props.size === 'small' ? '2px' : '8px')};
  text-decoration: none;
  text-transform: capitalize;
  white-space: nowrap;

  &:hover {
    color: ${props => props.color};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Dropdown.Title')}
`

const DropdownMenu = styled.ul`
  background-color: ${th('colorBackground')};
  border-color: ${th('colorBorder')};
  border-style: ${th('borderStyle')};
  border-width: ${th('borderWidth')};
  bottom: ${props => (props.direction === 'down' ? '-' : '100%')};
  color: ${th('colorText')};
  display: ${props => (props.menuIsOpen ? 'block' : 'none')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  list-style-type: none;
  margin: calc(${th('gridUnit')} / 4) 0 0 0;
  padding: 0;
  position: absolute;
  top: ${props => (props.direction === 'down' ? '100%' : '-')};
  width: 100%;
  z-index: 9;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Dropdown.Menu')}
`

const Item = styled.li`
  cursor: pointer;
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  padding: ${th('gridUnit')};
  white-space: normal;
  overflow-wrap: break-word;

  &:hover {
    background-color: ${th('colorBackgroundHue')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Dropdown.MenuItem')}
`

const Dropdown = ({
  children,
  direction = 'down',
  icon,
  iconPosition = 'start',
  itemsList = [],
  primary = false,
  size = '',
  dataTestId = '',
  color,
}) => {
  const [menuIsOpen, setMenuIsOpen] = useState(false)

  let colorIcon

  if (color) {
    colorIcon = color
  } else {
    if (primary) {
      colorIcon = '#fff'
    } else {
      colorIcon = '#0B65CB'
    }
  }

  const getIconDirection = () => {
    if (direction === 'up') {
      return menuIsOpen ? 'chevron-down' : 'chevron-up'
    }

    return !menuIsOpen ? 'chevron-down' : 'chevron-up'
  }

  return (
    <StyledDropdown size={size}>
      <DropdownTitle
        color={color}
        data-test-id={dataTestId}
        onBlur={() => setMenuIsOpen(false)}
        onClick={() => setMenuIsOpen(!menuIsOpen)}
        primary={primary}
        size={size}
      >
        <span data-testid="iconButton">
          {icon && iconPosition === 'start' && (
            <Icon
              color={colorIcon}
              data-testid="leftIconButton"
              primary={primary}
            >
              {icon}{' '}
            </Icon>
          )}

          <span>{children}</span>

          {icon && iconPosition === 'end' && (
            <Icon color={colorIcon} data-testid="rightIconButton">
              {icon}{' '}
            </Icon>
          )}
        </span>
        <ChevronIcon color={colorIcon}>{getIconDirection()}</ChevronIcon>
      </DropdownTitle>
      <DropdownMenu direction={direction} menuIsOpen={menuIsOpen}>
        {itemsList.map(item => (
          <Item
            key={item.id}
            onClick={() => {
              item.onClick()
              setMenuIsOpen(false)
            }}
            {...item.props}
            data-test-id={item.dataTestId}
            onMouseDown={e => e.preventDefault()}
          >
            {item.title}
          </Item>
        ))}
      </DropdownMenu>
    </StyledDropdown>
  )
}

Dropdown.propTypes = {
  /** Content of the button of the dropdown */
  children: PropTypes.node.isRequired,
  dataTestId: PropTypes.string,

  /** Dropdow direction */
  direction: PropTypes.oneOf(['up', 'down']),
  /** Icon name (An icon name, from the Feather icon set.) */
  icon: PropTypes.string,
  /** Icon Position (Defines the position of the icon (if is is at the start of the button , or at the end)) */
  iconPosition: PropTypes.oneOf(['start', 'end']),

  /** List of the items for the drop down items */
  itemsList: PropTypes.arrayOf(
    PropTypes.shape({
      /** The key for the item  */
      id: PropTypes.string.isRequired,

      /** The click function for the item  */
      onClick: PropTypes.func,

      /** The title for the item  */
      title: PropTypes.node.isRequired,
    }),
  ),

  size: PropTypes.string,

  /** Primary property for the dropdown, if it is false(or not set) then the dropdown will be secondary  */
  primary: PropTypes.bool,
}

export default Dropdown

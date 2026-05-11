/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import * as icons from 'react-feather'
import styled from 'styled-components'
import { th } from '@coko/client'

const IconWrapper = styled.div`
  align-items: center;
  border-radius: 6px;
  display: ${props => (props.$inline ? 'inline-flex' : 'flex')};
  justify-content: center;
  opacity: 1;
  padding: ${props => (props.$noPadding || props.$inline ? '0' : '8px 12px')};
  position: relative;
  top: ${props => props.top || 0};

  svg {
    height: calc(${props => props.size} * ${th('gridUnit')});
    stroke: ${props => props.$iconColor || props.theme.colorText};
    width: calc(${props => props.size} * ${th('gridUnit')});
  }
`

export const Icon = ({
  className,
  children,
  color = '#111111',
  size = 3,
  noPadding,
  inline,
  top,
  onClick,
}) => {
  const name = upperFirst(camelCase(children))
  const IconComponent = icons[name]

  return (
    <IconWrapper
      $iconColor={color}
      $inline={inline}
      $noPadding={noPadding}
      className={className}
      onClick={onClick}
      role="img"
      size={size}
      top={top}
    >
      {IconComponent ? <IconComponent /> : null}
    </IconWrapper>
  )
}

Icon.propTypes = {
  children: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
}

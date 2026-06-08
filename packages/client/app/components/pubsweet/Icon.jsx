/* eslint-disable react/prop-types, new-cap, react-hooks/static-components */

import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
import get from 'lodash/get'
import * as icons from 'react-feather'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { th, override } from '@coko/client'

import Colorize from './Colorize'

const Container = styled.span`
  display: inline-flex;
  padding: calc(${th('gridUnit')} / 2);

  svg {
    height: calc(${props => props.size} * ${th('gridUnit')});
    stroke: ${props => props.color || props.theme.colorText};
    width: calc(${props => props.size} * ${th('gridUnit')});
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Icon')};
`

const Icon = ({ children, color, size = 3, theme, ...props }) => {
  // convert `arrow_left` to `ArrowLeft`
  const name = upperFirst(camelCase(children))

  // select the icon, checking for override in theme, otherwise defaulting
  // to the react feather icon set
  const icon = get(theme.icons, name, icons[name])

  if (!icon) {
    console.warn("Icon '%s' not found", name)
  }

  const IconComponent = icon

  return (
    <Container color={color} role="img" size={size} {...props}>
      {IconComponent ? <IconComponent /> : ''}
    </Container>
  )
}

Icon.propTypes = {
  size: PropTypes.number,
  color: PropTypes.string,
}

export default Colorize(Icon)

/* eslint-disable new-cap */

import propTypes from 'prop-types'
import styled, { keyframes } from 'styled-components'

import Icon from './Icon'
import Colorize from './Colorize'

const Spinner = ({ icon = 'loader', size = 2, color = '#444' }) => (
  <Root>
    <Icon color={color} size={size}>
      {icon}
    </Icon>
  </Root>
)

const rotating = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`

const Root = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;

  svg {
    animation: ${rotating} 1.5s linear infinite;
  }
`

Spinner.propTypes = {
  /** Feather icon (https://feathericons.com/) */
  icon: propTypes.string,
  /** String or HEX color */
  color: propTypes.string,
  /** Size of the Icon component  */
  size: propTypes.number,
}

export default Colorize(Spinner)

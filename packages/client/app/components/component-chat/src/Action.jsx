/* eslint-disable react/prop-types */

/*
  Actions arose from current designs (like the Appbar) where we had to blend
  links and buttons, but make them appear the same.

  The Action centralizes the visual part of this scenario, while leaving the
  underlying mechanics of links and buttons intact.

  -- TODO
  THIS COULD BE REMOVED IN THE FUTURE, AS IT IS UNCLEAR WHETHER WE SHOULD
  HAVE LINKS AND BUTTONS THAT LOOK THE SAME IN THE FIRST PLACE.
*/

import styled, { css } from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../../theme'

const common = css`
  color: ${color.brand1.base};
  font: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  text-decoration: none;
  text-transform: none;
  transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};

  &:hover,
  &:active {
    background: none;
    color: ${color.brand1.base};
    text-decoration: underline;
  }
`

const ActionButton = styled.button`
  background: none;
  border: none;
  min-width: 0;
  padding: 0;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${common}
`

const Action = props => <ActionButton {...props}>{props.children}</ActionButton>

export default Action

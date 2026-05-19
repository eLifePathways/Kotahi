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
import { th, override } from '@coko/client'

import OriginalButton from './Button'
import OriginalLink from './Link'

const common = css`
  color: ${th('colorPrimary')};
  font: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  font-weight: ${props => (props.active ? 'bold' : 'normal')};
  text-decoration: none;
  text-transform: none;
  transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};

  &:hover,
  &:focus,
  &:active {
    background: none;
    color: ${th('colorPrimary')};
    text-decoration: underline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${override('ui.Action')};
`

const Button = styled(OriginalButton)`
  background: none;
  border: none;
  min-width: 0;
  padding: 0;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${common};
`

const Link = styled(OriginalLink)`
  ${common};
`

const Action = props => {
  if (props.to) return <Link {...props}>{props.children}</Link>
  return <Button {...props}>{props.children}</Button>
}

export default Action

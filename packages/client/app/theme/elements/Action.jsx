/* stylelint-disable string-quotes */

import { css } from 'styled-components'
import { th } from '@coko/client'
import color from '../color'

const underlineFade = css`
  &::before {
    opacity: 0;
    transition: ${th('transitionDuration')} ease;
  }

  &:hover::before {
    opacity: 1;
  }
`

// const underlineGrow = css`
//   &:before {
//     transform: scaleX(0);
//     transition: ${th('transitionDuration')} ease;
//   }

//   &:hover:before {
//     transform: scaleX(1);
//   }
// `

const underlineAnimation = css`
  position: relative;

  &:hover,
  &:focus,
  &:active {
    text-decoration: none;
  }

  &::before {
    background-color: ${color.brand1.base};
    bottom: 0;
    content: '';
    height: 2px;
    left: 0;
    position: absolute;
    visibility: hidden;
    width: 100%;
  }

  &:hover::before {
    visibility: visible;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${underlineFade}
`

const active = css`
  font-weight: normal;

  &::before {
    opacity: 1;
    visibility: visible;
  }
`

export default css`
  ${underlineAnimation};
  ${props => props.active && active};
`

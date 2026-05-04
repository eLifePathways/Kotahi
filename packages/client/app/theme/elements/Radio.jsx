/* stylelint-disable string-quotes */

import { css, keyframes } from 'styled-components'
import { th } from '@coko/client'
import color from '../color'

const checking = keyframes`
  0% {
    transform: scale(0.8);
  }

  20% {
    transform: scale(1.2);
  }

  80% {
    transform: scale(1);
  }

  100% {
    transform: scale(1);
  }
`

export default {
  Root: css`
    &:hover {
      span {
        color: ${props => (props.checked ? 'inherit' : color.brand1.base)};

        &::before {
          animation-duration: ${th('transitionDuration')};
          animation-name: ${props => (props.checked ? 'none' : checking)};
          box-shadow: 0 0 0 ${th('borderWidth')}
            ${props => (props.checked ? 'currentColor' : color.brand1.base)};
        }
      }
    }
  `,
  Label: css`
    font-style: italic;

    &::before {
      background: ${props => (props.checked ? 'currentColor' : 'transparent')};

      /* This is not a real border (box-shadow provides that), so not themed as such */
      border: calc(${th('gridUnit')} / 4) solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 ${th('borderWidth')} currentColor;

      color: ${props => (props.color ? props.color : color.text)};
      content: ' ';
      display: inline-block;
      height: calc(${th('gridUnit')} * 2);
      margin-left: ${th('gridUnit')};
      margin-right: ${th('gridUnit')};

      transition: border ${th('transitionDuration')}
        ${th('transitionTimingFunction')};

      vertical-align: middle;
      width: calc(${th('gridUnit')} * 2);
    }
  `,
  Input: css`
    clip: rect(0, 0, 0, 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    position: absolute;
    white-space: nowrap;
    width: 1px;
  `,
}

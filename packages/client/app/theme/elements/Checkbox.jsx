import { css, keyframes } from 'styled-components'
import { th } from '@coko/client'

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

const localBorderTwoSize = '1px'

// TODO: Make Checkboxes prettier, e.g. Chakra UI for inspiration
export default {
  Root: css`
    &:hover span {
      color: ${th('color.brand1.base')};

      &::before {
        animation: ${checking} 0.5s;
        box-shadow: 0 0 0 ${localBorderTwoSize} ${th('color.brand1.base')};
      }
    }
  `,
}

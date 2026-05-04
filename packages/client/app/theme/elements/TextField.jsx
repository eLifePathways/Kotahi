import { css } from 'styled-components'
import { th, grid } from '@coko/client'
import color from '../color'

export default {
  Input: css`
    border-color: ${props => {
      switch (props.validationStatus) {
        case 'success':
          return props.theme.colorBorder
        case 'warning':
          return props.theme.colorWarning
        case 'error':
          return props.theme.colorError
        default:
          return props.theme.colorBorder
      }
    }};
    color: ${props => {
      switch (props.validationStatus) {
        case 'success':
          return props.theme.colorText
        case 'warning':
          return props.theme.colorWarning
        case 'error':
          return props.theme.colorError
        default:
          return 'inherit'
      }
    }};
    outline: 0;
    transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};

    &:focus {
      border-color: ${props => {
        switch (props.validationStatus) {
          case 'success':
            return props.theme.colorSuccess
          case 'warning':
            return props.theme.colorWarning
          case 'error':
            return props.theme.colorError
          default:
            return color.brand1.base
        }
      }};
      box-shadow: ${th('boxShadow')};
      color: inherit;
    }

    &::placeholder {
      font-size: ${th('fontSizeBaseSmall')};
      line-height: ${th('lineHeightBaseSmall')};
    }
  `,

  Label: css`
    margin-bottom: ${grid(1)};
  `,
}

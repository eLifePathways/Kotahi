import { css } from 'styled-components'
import color from '../color'

/*
  To disable underline from Logo
*/

export default {
  Root: css`
    box-shadow: 0 0 1px ${color.brand1.base};
    margin-bottom: 1px;
  `,
  LogoLink: css`
    &:hover::before {
      visibility: hidden;
    }
  `,
}

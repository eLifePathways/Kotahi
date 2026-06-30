import { css } from 'styled-components'
import { th } from '@coko/client'

/*
  To disable underline from Logo
*/

export default {
  Root: css`
    box-shadow: 0 0 1px ${th('color.brand1.base')};
    margin-bottom: 1px;
  `,
  LogoLink: css`
    &:hover::before {
      visibility: hidden;
    }
  `,
}

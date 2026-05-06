import { css } from 'styled-components'

export default {
  Root: css`
    > * {
      &:last-child {
        border-right: 0;
      }
    }
  `,
  ActionWrapper: css`
    padding: 0 4px;
  `,
}

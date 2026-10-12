import { css } from 'styled-components'
import { grid, th } from '@coko/client'

const secondary = css`
  background: none;
  border: none;
  color: ${th('color.brand1.base')};
  padding: 0;
  text-decoration: underline;

  &:hover,
  &:focus,
  &:active {
    background: none;
    border: none;
    color: ${th('color.brand1.shade25')};
  }

  &[disabled] {
    color: ${th('color.gray40')};
    cursor: default;

    &:hover {
      background: none;
    }

    &:hover::before {
      visibility: hidden;
    }
  }
`

export default css`
  border: none;
  font-weight: 500;
  line-height: ${grid(6)};
  min-width: ${grid(32)};
  ${props => !props.$primary && secondary};

  ${props =>
    props.$primary &&
    css`
      &:focus,
      &:hover {
        background-color: ${th('color.brand1.shade25')};
      }
    `}
`

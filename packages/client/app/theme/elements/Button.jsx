import { css } from 'styled-components'
import { th } from '@coko/client'
import color from '../color'

const secondary = css`
  background: none;
  border: none;
  color: ${color.brand1.base};
  padding: 0;
  text-decoration: underline;

  &:hover,
  &:focus,
  &:active {
    background: none;
    border: none;
    color: ${color.brand1.shade25};
    outline: none;
  }

  &[disabled] {
    color: ${color.gray40};
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
  line-height: calc(${th('gridUnit')} * 3);
  min-width: calc(${th('gridUnit')} * 16);
  ${props => !props.primary && secondary};

  &:focus,
  &:hover {
    background-color: ${color.brand1.tint25};
  }
`

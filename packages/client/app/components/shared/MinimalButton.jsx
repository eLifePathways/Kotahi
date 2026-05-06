/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid } from '@coko/client'
import { color } from '../../theme'

const BareButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${color.gray40};
  display: flex;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  justify-content: center;
  line-height: inherit;
  min-height: ${grid(3)};
  min-width: ${grid(3)};
  padding: 0 ${grid(0.5)};

  &:hover {
    color: ${color.brand1.base};
  }

  & svg {
    stroke: ${color.gray40};
  }

  &:hover svg {
    stroke: ${color.brand1.base};
  }
`

const MinimalButton = ({ children, type, ...rest }) => (
  <BareButton type={type || 'button'} {...rest}>
    {children}
  </BareButton>
)

export default MinimalButton

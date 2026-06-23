/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th, grid } from '@coko/client'

const BareButton = styled.button`
  align-items: center;
  background: none;
  border: none;
  color: ${th('color.gray40')};
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
    color: ${th('color.brand1.base')};
  }

  & svg {
    stroke: ${th('color.gray40')};
  }

  &:hover svg {
    stroke: ${th('color.brand1.base')};
  }
`

const MinimalButton = ({ children, type, ...rest }) => (
  <BareButton data-testid="minimal-button" type={type || 'button'} {...rest}>
    {children}
  </BareButton>
)

export default MinimalButton

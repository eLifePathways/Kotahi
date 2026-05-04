/* eslint-disable react/prop-types */

import styled from 'styled-components'

import { grid } from '@coko/client'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  > button {
    margin-right: ${grid(1)};
  }
`

const Footer = props => {
  const { className, children } = props
  return <Wrapper className={className}>{children}</Wrapper>
}

export default Footer

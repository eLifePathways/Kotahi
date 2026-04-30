/* eslint-disable react/prop-types */

import styled from 'styled-components'

import { th } from '@coko/client'

const Header = styled.div`
  font-family: ${th('fontHeading')};
  text-align: center;
  width: 100%;
`

const HeaderText = styled.div`
  color: ${th('colorText')};
  display: inline-block;
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
`

const ModalHeader = props => {
  const { className, text } = props

  return (
    <Header className={className}>
      <HeaderText>{text.toUpperCase()}</HeaderText>
    </Header>
  )
}

export default ModalHeader

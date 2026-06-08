/* eslint-disable react/prop-types */

/* stylelint-disable color-function-notation, hue-degree-notation */

import { useState } from 'react'
import styled from 'styled-components'

const CollapseWrapper = styled.div`
  border-left: 1px solid #e5e5e5;
  display: flex;
  height: 100vh;
  left: ${props =>
    props.showCollapse ? `calc(100% - ${props.defaultWidth}px)` : '99%'};
  max-height: 100vh;
  position: fixed;
  transition: all 300ms;
  width: ${props => (props.showCollapse ? `${props.defaultWidth}px` : '0px')};
`

const DragIconWrap = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 0;
`

const DragIcon = styled.div`
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 10px;
  /* color: linear-gradient(134deg, #3aae2a, hsl(112.7, 61.1%, 59.6%)); */
  cursor: pointer;
  left: 0;
  padding: 10px 20px;
  position: relative;
  width: max-content;
  z-index: 100000000000;
`

const ChatCollapse = ({
  children,
  defaultWidth = 400,
  showCollapseData = false,
}) => {
  const [showCollapse, setShowCollapse] = useState(showCollapseData)
  return children ? (
    <CollapseWrapper defaultWidth={defaultWidth} showCollapse={showCollapse}>
      <DragIconWrap>
        {showCollapse ? (
          <DragIcon onClick={() => setShowCollapse(!showCollapse)}>
            {'>'}
          </DragIcon>
        ) : (
          <DragIcon onClick={() => setShowCollapse(!showCollapse)}>
            {'<'}
          </DragIcon>
        )}
      </DragIconWrap>
      {children}
    </CollapseWrapper>
  ) : (
    ''
  )
}

export default ChatCollapse

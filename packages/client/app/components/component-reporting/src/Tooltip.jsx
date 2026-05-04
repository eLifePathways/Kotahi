/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th, grid } from '@coko/client'

const Placeholder = styled.div`
  display: inline-block;
  height: 0;
  opacity: 0;
  position: relative;
  visibility: hidden;
  width: 0;

  *:hover > & {
    opacity: 1;
    transition-delay: 0.8s;
    visibility: visible;
  }
`

const Tip = styled.div`
  /* Common styles for the Tip component */
  color: ${th('colorText')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
  position: absolute;
  right: -50px;
  top: 15px;
  width: max-content;
  z-index: 999;

  &.tooltip-message {
    right: 0;
    top: 0;
  }
`

const TipInner = styled.div`
  background-color: ${th('colorFurniture')};
  border: 1px solid ${th('colorBorder')};
  padding: ${grid(0.25)} ${grid(1)};
`

const Tooltip = ({ content, className }) => {
  return (
    <Placeholder>
      <Tip className={className}>
        <TipInner>{content}</TipInner>
      </Tip>
    </Placeholder>
  )
}

export default Tooltip

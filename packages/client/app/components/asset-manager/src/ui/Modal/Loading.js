/* stylelint-disable string-quotes */

import styled from 'styled-components'
import { rotate360 } from '@coko/client'
import { color } from '../../../../../theme'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`

const SpinnerAnimation = styled.div`
  display: inline-block;
  height: 64px;
  width: 64px;

  &::after {
    animation: ${rotate360} 1s linear infinite;
    border: 5px solid ${color.brand1.base};
    border-color: ${color.brand1.base} transparent ${color.brand1.base}
      transparent;
    border-radius: 50%;
    content: ' ';
    display: block;
    height: 46px;
    margin: 1px;
    width: 46px;
  }
`

const Loading = () => (
  <Wrapper>
    <SpinnerAnimation />
  </Wrapper>
)

export default Loading

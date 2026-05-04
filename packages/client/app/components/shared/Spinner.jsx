import styled from 'styled-components'
import { rotate360, th } from '@coko/client'
import { color } from '../../theme'

// Courtesy of loading.io/css
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

const LoadingPage = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  padding-bottom: calc(${th('gridUnit')} * 2);
  width: 100%;
`

export const Spinner = () => (
  <LoadingPage>
    <SpinnerAnimation />
  </LoadingPage>
)

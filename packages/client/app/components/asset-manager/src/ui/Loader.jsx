import styled from 'styled-components'
import { th } from '@coko/client'
import { color } from '../../../../theme'

const StyledSpinner = styled.svg`
  animation: rotate 1s linear infinite;
  height: 50px;
  margin: 40px;
  width: 50px;

  & .path {
    animation: dash 1.5s ease-in-out infinite;
    stroke: ${color.brand1.base};
    stroke-linecap: round;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 150;
      stroke-dashoffset: 0;
    }

    50% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -35;
    }

    100% {
      stroke-dasharray: 90, 150;
      stroke-dashoffset: -124;
    }
  }
`

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  width: 100%;
`

const Label = styled.div`
  color: ${color.brand1.base};
  font-family: ${th('fontHeading')};
  font-size: ${th('fontSizeBase')};
  line-height: ${th('lineHeightBase')};
`

const Loader = () => (
  <Wrapper>
    <StyledSpinner viewBox="0 0 50 50">
      <circle
        className="path"
        cx="25"
        cy="25"
        fill="none"
        r="20"
        strokeWidth="2"
      />
    </StyledSpinner>
    <Label>Loading ...</Label>
  </Wrapper>
)

export default Loader

/* eslint-disable react/prop-types */

import styled from 'styled-components'

const OverlayContainer = styled.div`
  left: ${props => `${props.$position.left}px`};
  position: ${props => props.$position.position};
  top: ${props => `${props.$position.top}px`};
  z-index: ${props => props.$position.zIndex};
`

const Overlay = ({ position, children }) => (
  <OverlayContainer $position={position}>{children}</OverlayContainer>
)

export default Overlay

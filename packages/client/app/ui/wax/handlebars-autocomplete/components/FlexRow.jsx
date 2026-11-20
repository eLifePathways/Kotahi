import styled from 'styled-components'
import { grid } from '@coko/client'

const FlexRow = styled.div`
  display: flex;
  gap: ${grid(2)};
  justify-content: space-between;
`

export default FlexRow

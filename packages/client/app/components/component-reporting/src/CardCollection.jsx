import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const Card = styled.div`
  background-color: ${th('colorBackground')};
  border: 1px solid ${th('colorFurniture')};
  flex: 1 0 auto;
  margin: ${grid(1)};
  padding: ${grid(1)};
`

const CardCollection = styled.div`
  align-content: stretch;
  align-items: stretch;
  display: flex;
  flex-wrap: wrap;
`

export default CardCollection

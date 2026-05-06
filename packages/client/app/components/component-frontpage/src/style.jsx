import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const Container = styled.div`
  background: ${th('colorBackgroundHue')};
  max-height: 100vh;
  min-height: 100vh;
  overflow-y: scroll;
  padding: ${grid(2)};
`

export const Placeholder = styled.div`
  color: ${th('colorTextPlaceholder')};
  display: grid;
  height: 100%;
  padding: 4em;
  place-items: center;
`

export const VisualAbstract = styled.img`
  display: block;
  max-height: ${grid(40)};
  max-width: ${grid(40)};
`

export const Abstract = styled.div``

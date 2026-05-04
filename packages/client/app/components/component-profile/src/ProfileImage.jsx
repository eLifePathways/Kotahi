import { th } from '@coko/client'
import styled from 'styled-components'

export const BigProfileImage = styled.img`
  border-radius: 50%;
  height: calc(${th('gridUnit')} * 6);
  object-fit: cover;
  width: calc(${th('gridUnit')} * 6);
`

export const SmallProfileImage = styled.img`
  border-radius: 50%;
  height: calc(${th('gridUnit')} * 4);
  object-fit: cover;
  width: calc(${th('gridUnit')} * 4);
`

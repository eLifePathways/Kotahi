import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const UserCombo = styled.div`
  align-items: center;
  display: flex;
  line-height: ${grid(2.5)};
`

export const Primary = styled.b`
  font-weight: 500;
`

export const Secondary = styled.div`
  color: ${th('colorTextPlaceholder')};
`

export const UserInfo = styled.div`
  margin-left: ${grid(1)};
`

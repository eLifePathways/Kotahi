import styled from 'styled-components'
import { ArrowUp, ArrowDown } from 'react-feather'
import { th, grid } from '@coko/client'

export const SortUp = styled(ArrowUp)`
  height: ${grid(2)};
  stroke: ${th('colorBorder')};
  width: ${grid(2)};

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

export const SortDown = styled(ArrowDown)`
  height: ${grid(2)};
  stroke: ${th('colorBorder')};
  width: ${grid(2)};

  &:hover {
    stroke: ${th('colorPrimary')};
  }
`

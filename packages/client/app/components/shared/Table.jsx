/* stylelint-disable declaration-block-no-redundant-longhand-properties */

import styled from 'styled-components'
import { th, grid } from '@coko/client'

export const Table = styled.table`
  border-collapse: collapse;
  border-radius: ${th('borderRadius')};
  font-size: ${th('fontSizeBaseSmall')};
  margin-top: ${grid(2)};
  table-layout: fixed;
  width: 100%;

  td {
    width: 25%;
  }
`

export const Header = styled.thead`
  background-color: ${th('colorSecondaryBackground')};
  border-bottom: 1px solid ${th('colorFurniture')};
  font-variant: all-small-caps;
  line-height: 1.25em;
  text-align: left;

  th {
    padding: ${grid(1)} ${grid(3)};
  }
`

export const Row = styled.tr`
  border-bottom: 1px solid ${th('colorFurniture')};
  max-height: ${grid(8)};

  &:hover {
    background-color: ${th('colorBackgroundHue')};
  }
`

export const Cell = styled.td`
  ${({ minWidth }) => minWidth && `min-width: ${minWidth}`};
  padding-bottom: ${grid(2)};
  padding-left: ${grid(3)};
  padding-right: ${grid(3)};
  padding-top: calc(${grid(2)} - 1px);

  button {
    font-size: ${th('fontSizeBaseSmall')};
  }
`

export const LastCell = styled(Cell)`
  text-align: right;
`

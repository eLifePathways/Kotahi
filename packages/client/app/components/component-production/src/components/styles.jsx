/* stylelint-disable string-quotes */

import styled, { css } from 'styled-components'
import { grid } from '@coko/client'
import { color } from '../../../../theme'

export const Info = styled.span`
  align-items: center;
  display: flex;
  height: 500px;
  justify-content: center;
  list-style: none;
  margin: 0;
  padding: 0;
`

export const PopUpH2 = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 1em;
  margin-top: 24px;
  text-align: center;
`

export const PopUpTextContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;

  & p.linkurl {
    background-color: ${color.gray95};
    border-radius: 2px;
    max-width: 300px;
    overflow-x: scroll;
    padding: 3px 8px;
    white-space: nowrap;

    & a {
      color: ${color.text};
    }
  }

  & p.linknote {
    color: #b91c1c;
    font-size: 12px;
    letter-spacing: 0.5px;
    margin-top: 12px;
    text-transform: uppercase;
  }

  & button.copybutton {
    background-color: ${color.backgroundA};
    border: ${color.brand1.base} solid 1px;
    border-radius: 4px;
    color: ${color.brand1.base};
    cursor: pointer;
    margin-top: 24px;
    padding: 12px 16px;
    text-transform: uppercase;
    transition: 0.25s;
    user-select: none;

    &:hover {
      border-color: ${color.text};
      color: ${color.text};
    }
  }
`

export const CloseButton = styled.span`
  align-items: center;
  background-color: ${color.brand1.base};
  border-radius: 100%;
  color: ${color.textReverse};
  display: inline-flex;
  height: var(--size);
  justify-content: center;
  position: absolute;
  right: 10px;
  top: 10px;
  user-select: none;
  width: var(--size);

  --size: 24px;

  &:hover {
    cursor: pointer;
  }

  &::before {
    content: '×';
    font-size: var(--size);
    position: relative;
  }
`

export const Cell = styled.div`
  display: flex;
  flex: ${({ flex }) => flex ?? '0 1 12em'};
  flex-direction: row;
  ${props =>
    props.onClick &&
    css`
      cursor: pointer;
    `}
  ${props =>
    props.centered &&
    css`
      justify-content: center;
    `}
  overflow-wrap: anywhere;
`

export const HeadingCell = styled(Cell)`
  align-items: center;
  display: flex;
`

export const StyledFileRow = styled.div`
  align-items: center;
  background-color: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  column-gap: ${grid(2)};
  display: flex;
  flex-direction: row;
  line-height: 1.4em;
  text-align: left;
  width: 100%;

  &:first-child {
    border-top: none;
    padding: ${grid(0.5)} ${grid(2)};
  }

  &:not(:first-child) {
    padding: ${grid(1.5)} ${grid(2)};
  }
`

export const Heading = styled.span`
  font-weight: inherit;
  overflow: hidden;
  padding: 0 1em 0 0;
  text-overflow: ellipsis;
  white-space: nowrap;
`

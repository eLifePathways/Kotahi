import styled, { css } from 'styled-components'
import { th } from '@coko/client'

export const TabsContainer = styled.div.attrs({
  'data-testid': 'tabs-container',
})`
  display: flex;
  justify-content: space-between;

  ${props =>
    props.$config &&
    css`
      margin-top: ${() =>
        ['preprint2'].includes(props.$config.instanceName) ? '16px' : '0'};
    `}

  ${props =>
    props.$background &&
    css`
      background-color: ${th(props.$background)};
    `}

  ${props =>
    props.gridArea &&
    css`
      grid-area: ${props.gridArea};
    `};

  ${props =>
    props.sticky && `background-color: ${props.theme.color.backgroundC};`}
  ${props => props.sticky && 'position: sticky;'}
  ${props => props.sticky && 'top: -16px;'}
  ${props => props.sticky && 'z-index: 999;'}

  & ~ div .waxmenu {
    ${props => props.sticky && 'top: 23px;'};
  }
`

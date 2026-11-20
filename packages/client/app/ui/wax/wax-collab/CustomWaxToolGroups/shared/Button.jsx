import styled, { css } from 'styled-components'
import { darken, override, th, grid } from '@coko/client'

const StyledButton = styled.button.attrs(props => ({
  'data-testid': props['data-testid'],
  type: props.type || 'button',
}))`
  background: ${th('colorSecondary')};
  border: ${th('borderWidth')} ${th('borderStyle')} ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  color: ${th('colorText')};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBase')};
  line-height: ${grid(6)};
  min-width: ${grid(24)};
  padding: ${grid(2)};

  &:focus,
  &:hover {
    background-color: ${darken('colorSecondary', 0.3)};
    color: ${th('colorText')};
    transition: ${th('transitionDuration')} ${th('transitionTimingFunction')};
  }

  &:active {
    background-color: ${darken('colorSecondary', 0.5)};
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;

    &:focus,
    &:hover,
    &:active {
      background: ${th('colorSecondary')};
    }
  }

  ${props =>
    props.$primary &&
    css`
      background: ${th('colorPrimary')};
      color: ${th('colorTextReverse')};

      &:focus,
      &:hover {
        background-color: ${darken('colorPrimary', 0.3)};
        color: ${th('colorTextReverse')};
      }

      &:active {
        background-color: ${darken('colorPrimary', 0.5)};
      }

      &[disabled] {
        &:focus,
        &:hover,
        &:active {
          background: ${th('colorPrimary')};
        }
      }
    `};

  ${override('ui.Button')};
`

export default StyledButton

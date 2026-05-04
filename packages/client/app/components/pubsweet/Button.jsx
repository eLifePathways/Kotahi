import styled, { css } from 'styled-components'
import { darken, override, th } from '@coko/client'

const backgroundColor = props =>
  props.background ? props.background : props.theme.colorPrimary

const borderColor = props => (props.color ? props.color : props.colorPrimary)

const outline = css`
  border: ${th('borderWidth')} ${th('borderStyle')} ${borderColor};
  padding: ${props => (props.size === 'small' ? '0' : props.theme.gridUnit)};
  text-decoration: none;

  &:hover,
  &:focus,
  &:active {
    border: ${th('borderWidth')} ${th('borderStyle')} ${borderColor};
  }
`

const primary = css`
  background: ${backgroundColor};
  color: ${props => (props.color ? props.color : props.theme.colorTextReverse)};

  &:focus,
  &:hover {
    background-color: ${props =>
      props.background
        ? darken(props.background, 0.3)
        : darken(props.theme.colorPrimary, 0.3)};
  }

  &:active {
    background-color: ${props =>
      props.background
        ? darken(props.background, 0.5)
        : darken(props.theme.colorPrimary, 0.5)};
  }

  &[disabled] {
    &:focus,
    &:hover,
    &:active {
      background: ${backgroundColor};
    }
  }
`

const StyledButton = styled.button.attrs(props => ({
  'data-test-id': props['data-test-id'],
  type: props.type || 'button',
}))`
  background: ${th('colorSecondary')};
  border: ${th('borderWidth')} ${th('borderStyle')} ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  color: ${props => (props.color ? props.color : props.theme.colorText)};
  cursor: ${p => (p.disabled ? 'not-allowed' : 'pointer')};
  font-family: ${th('fontInterface')};
  font-size: ${props =>
    props.size === 'small'
      ? props.theme.fontSizeBaseSmall
      : props.theme.fontSizeBase};
  line-height: calc(${th('gridUnit')} * 3);
  min-width: calc(${th('gridUnit')} * 12);
  padding: ${props => (props.size === 'small' ? '0' : props.theme.gridUnit)};

  &:focus,
  &:hover {
    background-color: ${darken('colorSecondary', 0.3)};
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

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props => props.primary && primary};
  ${props => props.outline && outline}
  ${override('ui.Button')};
`

export default StyledButton

/* eslint-disable no-shadow */
/* stylelint-disable declaration-no-important, string-quotes */

import styled, { css } from 'styled-components'
import { th } from '@coko/client'
import { MEDIA_BREAK } from '../../../layout'
import { zIndex } from '../../../../globals'

export const theme = {
  text: {
    alt: '#000',
    placeholder: '#000',
    reverse: '#000',
  },
  bg: {
    border: '#000',
  },
  warn: {
    alt: '#000',
  },
  brand: {
    default: '#000',
  },
  special: {
    default: '#000',
    wash: '#000',
  },
}

export const hexa = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  if (alpha >= 0) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  return `rgb(${r}, ${g}, ${b})`
}

export const SvgWrapper = styled.div`
  color: inherit;
  display: inline-block;
  flex: 0 0 ${props => (props.size ? `${props.size}px` : '32px')};
  height: ${props => (props.size ? `${props.size}px` : '32px')};
  min-height: ${props => (props.size ? `${props.size}px` : '32px')};
  min-width: ${props => (props.size ? `${props.size}px` : '32px')};
  position: relative;
  width: ${props => (props.size ? `${props.size}px` : '32px')};

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${props =>
    props.count &&
    css`
      background-color: transparent;
      &:after {
        content: ${props.count ? `'${props.count}'` : `''`};
        position: absolute;
        left: calc(100% - 12px);
        top: -2px;
        font-size: 14px;
        font-weight: 600;
        background: ${theme.bg.default};
        color: ${({ theme }) =>
          process.env.NODE_ENV === 'production'
            ? theme.text.default
            : theme.warn.alt};
        border-radius: 8px;
        padding: 2px 4px;
        border: 2px solid
          ${({ theme }) =>
            process.env.NODE_ENV === 'production'
              ? theme.text.default
              : theme.warn.alt};
      }
    `};
`

export const QuoteWrapper = styled.div`
  border-left: 4px solid ${theme.bg.border};
  color: ${theme.text.alt};
  cursor: pointer;
  margin-bottom: 8px;
  margin-top: 4px;
  max-height: ${props => (props.expanded ? 'none' : '7em')};
  overflow-y: hidden;
  padding: 4px 12px 4px 16px;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${SvgWrapper} {
    margin-left: -3px;
    margin-right: 2px;
  }
`

export const monoStack = css`
  font-family: 'Input Mono', Menlo, Inconsolata, 'Roboto Mono', monospace;
`

export const FlexRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
`

export const ChatInputContainer = styled(FlexRow)`
  display: flex;
  flex: none;
  flex-direction: column;
  grid-area: write;
  margin: 0;
  position: relative;
  width: 100%;
  z-index: inherit;

  a {
    text-decoration: underline;
  }
`

export const ChatInputWrapper = styled.div`
  align-items: flex-end;
  background-color: ${th('colorBackground')};
  display: flex;
  flex-direction: row;
  margin-bottom: ${th('gridUnit')};
  padding: 8px 4px 0;
  width: 100%;

  @media (max-width: ${MEDIA_BREAK}px) {
    bottom: ${props => (props.focus ? '0' : 'auto')};
    padding: 8px;
    position: relative;
    z-index: ${zIndex.mobileInput};
  }
`

export const Form = styled.form`
  align-items: flex-end;
  background-color: transparent;
  border-radius: 24px;
  display: flex;
  flex: auto;
  margin-left: 4px;
  max-width: 100%;
  min-width: 1px;
  position: relative;

  & > button {
    /* Make height of button consistent with the Input Box */
    padding: 10px ${th('gridUnit')};
  }
`

export const InputWrapper = styled.div`
  align-items: stretch;
  background: ${props =>
    props.networkDisabled
      ? hexa(props.theme.special.default, 0.1)
      : th('colorBackground')};
  border-radius: 10px;
  color: ${props =>
    props.networkDisabled ? th('colorText') : th('colorSecondary')};
  display: flex;
  flex: auto;
  flex-direction: column;
  margin-right: 8px;
  min-height: 40px;
  transition: padding 0.2s ease-in-out;
  transition: border 0.3s ease-out;

  &:hover,
  &:focus {
    border-color: ${props =>
      props.networkDisabled ? th('borderColor') : th('colorWarning')};
    transition: border-color 0.2s ease-in;
  }

  @media (max-width: ${MEDIA_BREAK}px) {
    padding-left: 16px;
  }
`

export const MediaInput = styled.input`
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  width: 0.1px;
`

export const MediaLabel = styled.label`
  background: transparent;
  border: none;
  border-radius: 4px;
  color: ${theme.text.alt};
  display: inline-block;
  outline: 0;
  padding: 4px;
  position: relative;
  top: 2px;
  transition: color 0.3s ease-out;

  &:hover {
    color: ${theme.brand.default};
    cursor: pointer;
  }
`

export const RemovePreviewButton = styled.button`
  background-color: ${theme.text.placeholder};
  border: none;
  border-radius: 100%;
  color: ${theme.text.reverse};
  cursor: pointer;
  max-height: 24px;
  max-width: 24px;
  outline: none;
  padding: 4px;
  position: absolute;
  right: 0;
  top: 0;
  vertical-align: top;
  z-index: 1;

  &:hover {
    background-color: ${theme.warn.alt};
  }
`

export const PreviewWrapper = styled.div`
  border-bottom: 1px solid ${th('colorBorder')};
  padding: 0;
  padding-bottom: 8px;
  position: relative;

  ${QuoteWrapper} {
    border-left: 0;
    margin: 0;
    margin-left: -12px;
    margin-top: -6px;
  }

  & + & {
    padding-top: 16px;

    ${RemovePreviewButton} {
      top: 16px;
    }
  }

  & > img {
    border-radius: 8px;
    max-width: 37%;
  }
`

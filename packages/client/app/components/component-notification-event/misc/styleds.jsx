/* stylelint-disable declaration-no-important */
import { grid, th, theme } from '@coko/client'
import styled from 'styled-components'
import { FlexRow } from '../../component-cms-manager/src/style'
import { StyledInput } from '../../shared'
import { color } from '../../../theme'
import { CleanButton } from '../../component-email-templates/misc/styleds'

export const EventEditForm = styled.form`
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  overflow: hidden;
  padding: ${grid(2)} ${grid(6)} ${grid(3)};
  width: 100%;

  h3,
  p {
    margin: 0;
  }

  button {
    height: fit-content;
  }
`

export const Row = styled(FlexRow)`
  gap: ${grid(2)};
  width: 100%;
`

export const Col = styled(FlexRow)`
  flex-direction: column;
  height: inherit;
  width: 100%;
`

export const EventTitle = styled.h4`
  color: #fff;
  line-height: 1;
  margin: 0;
  padding: 0;
`

export const EditSection = styled(Col)`
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 0;
  justify-content: flex-start;
  max-height: ${p => (p.$collapsed ? '0' : '100%')};
  min-height: 0;
  overflow: auto;
  padding: 0 ${grid(4)};
  transition: all 0.3s;

  small {
    color: #555;
    display: flex;
    font-weight: bold;
    justify-content: space-between;
    width: 100%;

    /* stylelint-disable-next-line string-quotes */
    &[data-modified='true'] {
      color: ${color.warning.base};
    }
    /* stylelint-disable-next-line string-quotes */
    &[data-error='true'] {
      color: ${color.error.base};
    }
  }

  small,
  strong {
    padding: 0 ${grid(0.5)};
  }

  h4 {
    margin: 0;
    padding: ${grid(3)} ${grid(0.5)} ${grid(2)};
  }
`

export const TextInput = styled(StyledInput)`
  border-color: ${p => p.$color} !important;
  padding: ${grid(1.25)};
`

export const Header = styled(Row)`
  align-items: center;
  border-bottom: 1px solid #ddd;
  color: ${color.brand1.base};
  height: var(--header-height, 0);
  padding: 0 ${grid(4)};

  h3 {
    margin: 0;
  }
`

export const Content = styled(FlexRow)`
  background: #fff;
  gap: 0;
  height: calc(100% - var(--header-height, 0));
`

export const ActionIcon = styled(CleanButton)`
  border: 1px solid ${p => p.$color || color.brand1.base};
  border-radius: ${th('borderRadius')};
  filter: ${p => (p.$disabled ? 'grayscale(1)' : 'none')};
  padding: ${grid(1)};

  svg {
    aspect-ratio: 1 / 1;
    height: 22px;
    pointer-events: none;
    stroke: ${p => p.$color || color.brand1.base};
  }
`
export const CounterInputWrapper = styled(Row)`
  align-items: center;
  border: 1px solid ${p => (p.$changed ? color.warning.base : '#ddd')};
  border-radius: 4px;
  padding: 7px 10px;

  > div {
    border-left: 1px solid #ddd;
    gap: 8px;
    padding-left: 8px;
    width: fit-content;

    svg {
      aspect-ratio: 1 / 1;
      width: 16px;
    }
  }
`

export const InputWrapper = styled.div`
  align-items: center;
  background: ${color.gray99};
  border: 1px solid ${color.gray80};
  border-color: ${p => p.$color || '#ddd'};
  border-radius: 4px;
  box-shadow: inset 0 0 4px #0001;
  display: flex;
  font-size: ${theme.fontSizeBaseSmall};
  padding: 0 0 0 4px;
  width: 100%;

  &:hover {
    border: 1px solid ${color.gray70};
    outline: none;
    transition: ${theme.transitionDuration};
  }

  &:active,
  &:focus-visible {
    border: 1px solid ${color.brand1.base};
    outline: none;
    transition: ${theme.transitionDuration};
  }

  input {
    background: transparent;
    border: none;
    font-size: ${theme.fontSizeBaseSmall};
    padding: 0;
    width: 100%;
  }

  small {
    border-right: 1px solid #aaa;
    padding: 3px ${grid(1)};
    width: fit-content;
  }
`

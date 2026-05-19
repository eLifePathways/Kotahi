/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { th, override } from '@coko/client'

const Label = styled.span`
  ${override('ui.Checkbox.Label')};
`

const Input = styled.input`
  margin-right: ${th('gridUnit')};
  ${override('ui.Checkbox.Input')};
`

const Root = styled.label`
  align-items: center;
  cursor: pointer;
  display: ${props => (props.inline ? 'inline-flex' : 'flex')};
  font-family: ${th('fontAuthor')};

  &:not(:last-child) {
    margin-right: ${props => (props.inline ? props.theme.gridUnit : '0')};
  }

  ${override('ui.Checkbox')};
`

const Desc = styled.div`
  color: ${th('colorTextPlaceholder')};
  font-size: ${th('fontSizeBaseSmaller')};
  font-style: italic;
  margin-left: 20px;
  width: 100%;
`

const Checkbox = ({
  className,
  description,
  disabled,
  inline,
  name,
  value,
  label,
  checked,
  required,
  onChange,
}) => {
  checked = checked || false

  return (
    <Root checked={checked} className={className} inline={inline}>
      <Input
        checked={checked}
        disabled={disabled}
        name={name}
        onChange={onChange}
        required={required}
        type="checkbox"
        value={value}
      />
      <Label checked={checked}>{label}</Label>
      {description && <Desc>{description}</Desc>}
    </Root>
  )
}

export default Checkbox

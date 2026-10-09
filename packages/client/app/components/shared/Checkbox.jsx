/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { grid, th } from '@coko/client'

const CheckboxContainer = styled.div`
  align-content: center;
  display: flex;
  margin-bottom: 4px;

  input[type='checkbox'] {
    accent-color: ${th('color.brand1.shade25')};
    background: ${th('color.gray97')};
    border: 1px solid ${th('color.gray80')};
    border-radius: 5px;
    color: white;
    padding: 14px 9px;

    &:hover {
      accent-color: ${th('color.brand1.shade25')};
      border: none;
    }
  }

  label {
    margin-left: ${grid(1.875)};
  }
`

export const Checkbox = props => {
  const { checked, id, label, value, style = {}, handleChange } = props

  return (
    <CheckboxContainer style={style}>
      <input
        checked={checked}
        id={id}
        name={value}
        onChange={handleChange}
        type="checkbox"
      />
      <label htmlFor={id}>{label}</label>
    </CheckboxContainer>
  )
}

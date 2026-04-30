/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { Radio } from './Radio'

const Flexbox = styled.div`
  display: flex;
  flex-direction: ${props => (props.column ? 'column' : 'row')};
  justify-content: ${props => (props.center ? 'center' : 'left')};
`

export const RadioGroup = ({
  options,
  value: radioValue,
  'data-testid': dataTestid,
  className,
  disabled,
  inline,
  required,
  onChange,
}) => {
  const handleChange = event => {
    const { value } = event.target
    onChange(value)
  }

  return (
    <Flexbox column={!inline} data-testid={dataTestid}>
      {options.map(option => (
        <Radio
          checked={option.value === radioValue}
          className={className}
          color={option.color}
          disabled={disabled || option.disabled}
          inline={inline}
          key={option.value}
          label={option.label}
          name={option.name}
          onChange={handleChange}
          required={required}
          value={option.value}
        />
      ))}
    </Flexbox>
  )
}

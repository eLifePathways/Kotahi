/* eslint-disable react/prop-types */

import React from 'react'

import Radio from './Radio'
import Flexbox from './Flexbox'

class RadioGroup extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: props.value,
    }
  }

  handleChange = event => {
    const { value } = event.target
    this.setState({ value })
    this.props.onChange(value)
  }

  render() {
    const {
      className,
      disabled,
      inline,
      name,
      options,
      required,
      'data-testid': dataTestId,
    } = this.props
    const { value } = this.state

    return (
      <Flexbox column={!inline} data-testid={dataTestId}>
        {options.map(option => (
          <Radio
            checked={option.value === value}
            className={className}
            color={option.color}
            disabled={disabled || option.disabled}
            inline={inline}
            key={option.value}
            label={option.label}
            name={name}
            onChange={this.handleChange}
            required={required}
            value={option.value}
          />
        ))}
      </Flexbox>
    )
  }
}

export default RadioGroup

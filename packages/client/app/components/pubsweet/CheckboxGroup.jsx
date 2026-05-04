/* eslint-disable react/prop-types */

import React from 'react'

import Checkbox from './Checkbox'
import Flexbox from './Flexbox'

class CheckboxGroup extends React.Component {
  handleChange = event => {
    const values = this.props.value ? Array.from(this.props.value) : []

    const { value } = event.target

    if (event.target.checked) {
      values.push(value)
    } else {
      values.splice(values.indexOf(value), 1)
    }

    this.props.onChange(values)
  }

  render() {
    const { value, inline, name, options, required } = this.props

    return (
      <Flexbox column={!inline}>
        {options.map(option => (
          <Checkbox
            checked={
              !!value && Array.isArray(value) && value.includes(option.value)
            }
            description={option.description}
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

export default CheckboxGroup

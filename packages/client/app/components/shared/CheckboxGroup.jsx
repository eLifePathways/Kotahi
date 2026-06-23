/* eslint-disable react/prop-types */

import { Checkbox } from './Checkbox'

export const CheckboxGroup = ({
  options,
  value: values,
  'data-testid': dataTestid,
  ...props
}) => {
  const handleChange = event => {
    const { name } = event.target

    const newValues = Array.isArray(values)
      ? values.filter(v => v !== name)
      : []

    if (event.target.checked) newValues.push(name)
    props.onChange(newValues)
  }

  return (
    <div data-testid={dataTestid}>
      {options.map(option => (
        <Checkbox
          {...option}
          checked={values?.includes(option.value)}
          handleChange={handleChange}
          key={option.id}
        />
      ))}
    </div>
  )
}

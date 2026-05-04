/* eslint-disable react/prop-types */

import { useContext } from 'react'
import ReactSelect from 'react-select'
import { ThemeContext } from 'styled-components'
import { color } from '../../theme'

const styles = th => ({
  container: provided => ({
    ...provided,
    width: '100%',
  }),
  indicatorSeparator: provided => ({ ...provided, display: 'none' }),
  indicatorsContainer: provided => ({
    ...provided,
    height: 'fit-client',
    width: 'fit-client',
  }),
  dropdownIndicator: provided => ({
    ...provided,
    margin: '0 -3px',
    padding: '0',
  }),
  clearIndicator: provided => ({
    ...provided,
    margin: '0 -2px',
    padding: '0',
  }),
  menu: provided => ({
    ...provided,
    borderRadius: th.borderRadius,
    zIndex: 9999,
    width: 250,
  }),
  control: (provided, state) => ({
    ...provided,
    background: 'none',
    border: 'none',
    borderRadius: th.borderRadius,
    boxShadow: state.isFocused ? `0 0 0 1px ${color.brand1.base()}` : 'none',
    minHeight: '0',
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1
    const transition = 'opacity 300ms'

    return { ...provided, opacity, transition, height: '18px' }
  },

  option: (provided, state) => ({
    ...provided,
    backgroundColor:
      state.isFocused || state.isSelected ? color.gray90 : color.backgroundA,
    color: color.text,
  }),
  valueContainer: (provided, state) =>
    state.isMulti
      ? {
          ...provided,
          minHeight: '34px', // For multiselect, allow the component to grow vertically to show all selected options
          padding: '0',
        }
      : {
          ...provided,
          height: '34px', // For single-select, don't make the select box taller if the selected item wraps
          padding: '0',
        },
  multiValue: (provided, state) => {
    return state.data.isFixed
      ? { ...provided, backgroundColor: 'gray' }
      : provided
  },
  multiValueLabel: (provided, state) => {
    return state.data.isFixed
      ? { ...provided, fontWeight: 'bold', color: 'white', paddingRight: 6 }
      : provided
  },
  multiValueRemove: (provided, state) => {
    return state.data.isFixed ? { ...provided, display: 'none' } : provided
  },
})

export const MinimalSelect = ({
  value,
  isMulti,
  onChange,
  options,
  customStyles,
  ...otherProps
}) => {
  const theme = useContext(ThemeContext)
  let selectedOption = value

  if (!isMulti && value) {
    selectedOption = options.find(option => option.value === value)
  }

  const myStyles = { ...styles(theme), ...(customStyles || {}) }

  return (
    <ReactSelect
      isMulti={isMulti}
      onChange={(newVal, actionMeta) => {
        if (
          ['remove-value', 'pop-value'].includes(actionMeta.action) &&
          actionMeta.removedValue.isFixed
        )
          return
        onChange(newVal, actionMeta)
      }}
      options={options}
      {...otherProps}
      menuPlacement="auto"
      styles={myStyles}
      value={selectedOption}
    />
  )
}

export default MinimalSelect

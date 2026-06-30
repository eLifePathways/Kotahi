/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types, react/display-name */

/* eslint-disable no-nested-ternary */
import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ReactSelect, { components } from 'react-select'
import styled, { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'

const styles = theme => ({
  menu: provided => ({
    ...provided,
    borderRadius: theme.borderRadius,
    zIndex: 9999,
    width: '100%',
    fontSize: theme.fontSizeBaseSmall,
    marginTop: '4px',
  }),

  control: (provided, state) => ({
    ...provided,
    background: theme.color.gray97,
    border: !state.selectProps.standalone
      ? state.isFocused
        ? `1px solid ${theme.color.gray70}`
        : `1px solid ${theme.color.gray80}`
      : 'none',
    boxShadow: !state.selectProps.standalone
      ? state.isFocused
        ? `0 0 0 1px ${theme.color.brand1.base}`
        : 'inset 0px 0px 4px rgb(0 0 0 / 7%)'
      : state.isFocused
        ? `0 0 0 1px ${theme.color.brand1.base}`
        : theme.boxShadow,

    borderRadius: theme.borderRadius,
    '&:hover': {
      boxShadow: `1px solid ${theme.color.gray70}`,
    },
    fontSize: theme.fontSizeBaseSmall,
    minHeight: `calc(${theme.gridUnit} * 5)`,
    div: {
      color: theme.color.gray20,
    },
  }),

  singleValue: (provided, state) => {
    const opacity = state.isDisabled ? 0.5 : 1
    const transition = 'opacity 300ms'

    return { ...provided, opacity, transition }
  },

  option: (provided, state) => ({
    ...provided,
    backgroundColor:
      state.isFocused || state.isSelected ? theme.color.gray90 : 'white',
    color: theme.color.text,
  }),
})

const ValueWrapper = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  overflow: hidden;
  position: relative;
`

const getValueContainer =
  dataTestid =>
  ({ children, ...props }) => {
    return (
      <components.ValueContainer {...props}>
        <ValueWrapper data-testid={dataTestid}>{children}</ValueWrapper>
      </components.ValueContainer>
    )
  }

const SelectOption = ({ innerProps, ...props }) => (
  <components.Option
    {...props}
    innerProps={{ ...innerProps, 'data-testid': 'select-option' }}
  />
)

export const Select = props => {
  const {
    // name,
    value,
    isMulti = false,
    options,
    customStyles,
    hasGroupedOptions = false,
    'data-testid': dataTestid,
    ...otherProps
  } = props

  const theme = useContext(ThemeContext)
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState(value)

  useEffect(() => {
    if (value) {
      if (hasGroupedOptions) {
        options.some(option => {
          const optionMatched = option.options.find(
            subOption => subOption.value === value,
          )

          if (optionMatched) setSelectedOption(optionMatched)

          return !!optionMatched
        })
      } else {
        setSelectedOption(options.find(option => option.value === value))
      }
    } else {
      /* default Value from formBuilder */
      setSelectedOption(
        props?.options.find(option => option?.defaultValue === 1) || null,
      )
    }
  }, [value, hasGroupedOptions, options])

  const myStyles = { ...styles(theme), ...(customStyles || {}) }

  return (
    <ReactSelect
      classNamePrefix="react-select"
      components={{
        ValueContainer: getValueContainer(dataTestid),
        Option: SelectOption,
      }}
      isMulti={isMulti}
      options={options}
      {...otherProps}
      menuPlacement="auto"
      menuPortalTarget={document.querySelector('body')}
      noOptionsMessage={() => t('common.noOption')}
      styles={myStyles}
      value={selectedOption}
    />
  )
}

Select.propTypes = {
  value: PropTypes.any,
  isMulti: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
}

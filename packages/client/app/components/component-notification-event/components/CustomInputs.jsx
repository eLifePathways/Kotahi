/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react/prop-types */

/* eslint-disable no-nested-ternary */
import { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import ReactSelect from 'react-select'
import Creatable from 'react-select/creatable'
import { ThemeContext } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'react-feather'
import { color } from '../../../theme'
import { useNumber } from '../../../hooks/dataTypeHooks'
import { Col, CounterInputWrapper, InputWrapper, Row } from '../misc/styleds'
import { T } from '../misc/constants'
import { CleanButton } from '../../component-email-templates/misc/styleds'

const styles = th => ({
  menu: provided => ({
    ...provided,
    borderRadius: th.borderRadius,
    zIndex: 9999,
    width: '100%',
    fontSize: th.fontSizeBaseSmall,
    marginTop: '4px',
  }),

  control: (provided, state) => ({
    ...provided,
    background: color.gray97,
    border: !state.selectProps.standalone
      ? state.isFocused
        ? `1px solid ${color.gray70}`
        : `1px solid ${color.gray80}`
      : 'none',
    boxShadow: !state.selectProps.standalone
      ? state.isFocused
        ? `0 0 0 1px ${color.brand1.base}`
        : 'inset 0px 0px 4px rgb(0 0 0 / 7%)'
      : state.isFocused
        ? `0 0 0 1px ${color.brand1.base}`
        : th.boxShadow,

    borderRadius: th.borderRadius,
    '&:hover': {
      boxShadow: `1px solid ${color.gray70}`,
    },
    fontSize: th.fontSizeBaseSmall,
    minHeight: `calc(${th.gridUnit} * 5)`,
    div: {
      color: color.gray20,
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
      state.isFocused || state.isSelected ? color.gray90 : 'white',
    color: color.text,
  }),
})

export const Select = props => {
  const {
    // name,
    value,
    isMulti = false,
    options,
    customStyles,
    hasGroupedOptions = false,
    // dataTestid,
    ...otherProps
  } = props

  const th = useContext(ThemeContext)
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState(value)

  useEffect(() => {
    if (!isMulti && value) {
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
    }
  }, [value, isMulti, hasGroupedOptions, options])

  const myStyles = { ...styles(th), ...(customStyles || {}) }

  return (
    <ReactSelect
      classNamePrefix="react-select"
      isMulti={isMulti}
      menuPlacement="auto"
      menuPortalTarget={document.querySelector('body')}
      noOptionsMessage={() => t('common.noOption')}
      options={options}
      styles={myStyles}
      value={selectedOption}
      {...otherProps}
    />
  )
}

export const CreatableSelect = props => {
  const {
    // name,
    value,
    isMulti,
    options,
    customStyles,
    hasGroupedOptions = false,
    // dataTestid,
    ...otherProps
  } = props

  const th = useContext(ThemeContext)
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState(value)

  useEffect(() => {
    if (!isMulti && value) {
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
    }
  }, [value, isMulti, hasGroupedOptions, options])

  const myStyles = { ...styles(th), ...(customStyles || {}) }

  return (
    <Creatable
      classNamePrefix="react-select"
      isMulti={isMulti}
      menuPlacement="auto"
      menuPortalTarget={document.querySelector('body')}
      noOptionsMessage={() => t('common.noOption')}
      options={options}
      styles={myStyles}
      value={selectedOption}
      {...otherProps}
    />
  )
}

export const CounterInput = ({ options, label, ...rest }) => {
  const { t } = useTranslation()
  const delay = useNumber({ ...options })
  const { start } = options
  const { state: d } = delay
  const unchangedColor = d === start && '#555'
  const changedColor = d > start ? 'success' : 'error'
  const labelColor = unchangedColor || color[changedColor].base

  return (
    <Col>
      {label && (
        <small data-modified={d !== start}>
          {label}: {d !== start ? t(T.modified) : ''}
        </small>
      )}
      <CounterInputWrapper {...rest}>
        <span style={{ color: labelColor }}>
          <b style={{ padding: '0 1ch 0 0' }}>{d}</b>
          days
        </span>
        <Row>
          <CleanButton onClick={delay.sub}>
            <Minus />
          </CleanButton>
          <CleanButton onClick={delay.add}>
            <Plus />
          </CleanButton>
        </Row>
      </CounterInputWrapper>
    </Col>
  )
}

export const RegularInput = ({ $color, label, ...props }) => {
  return (
    <InputWrapper $color={$color}>
      {label && label}
      <input type="text" {...props} />
    </InputWrapper>
  )
}

Select.propTypes = {
  value: PropTypes.any,
  isMulti: PropTypes.bool,
  options: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
}

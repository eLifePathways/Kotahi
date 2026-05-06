/* eslint-disable react/prop-types */

import Select from 'react-select'
import { withTheme } from 'styled-components'

const StyledSelect = props => {
  const { theme, ...rest } = props

  const {
    borderStyle,
    borderWidth,
    colorBackground,
    colorBackgroundHue,
    colorBorder,
    colorPrimary,
    colorTextPlaceholder,
    colorText,
    colorTextReverse,
    fontInterface,
    fontSizeBase,
    gridUnit,
    lineHeightBase,
  } = theme

  const stylesFromTheme = {
    container: base => ({
      ...base,
      minWidth: '200px',
    }),
    control: (base, state) => {
      const myBase = {
        backgroundColor: colorBackground,
        border: 0,
        borderBottom: `${borderWidth} ${borderStyle} ${colorBorder}`,
        borderRadius: 0,
        color: colorText,
        display: 'flex',
        flex: '0 1 auto',
        fontFamily: fontInterface,
        fontSize: fontSizeBase,
        lineHeight: lineHeightBase,
        padding: gridUnit,
      }

      if (state.isFocused) {
        return {
          ...myBase,
          borderBottom: `${borderWidth} ${borderStyle} ${colorPrimary}`,
        }
      }

      return myBase
    },
    indicatorSeparator: base => ({
      ...base,
      display: 'none',
    }),
    input: base => ({
      ...base,
      margin: 0,
    }),
    menu: base => ({
      ...base,
      border: `${borderWidth} ${borderStyle} ${colorBorder}`,
      borderRadius: 0,
      boxShadow: 'none',
      flex: '0 1 100%',
      marginTop: gridUnit / 4,
    }),
    menuList: base => ({
      ...base,
    }),
    option: (base, state) => {
      const myBase = {
        ...base,
        backgroundColor: colorBackground,
        color: colorText,
        fontFamily: fontInterface,
        fontSize: fontSizeBase,
        lineHeight: lineHeightBase,
      }

      if (state.isSelected) {
        return {
          ...myBase,
          backgroundColor: colorPrimary,
          color: colorTextReverse,
        }
      }

      if (state.isFocused) {
        return {
          ...myBase,
          backgroundColor: colorBackgroundHue,
          color: colorText,
        }
      }

      if (state.isDisabled) {
        return {
          ...myBase,
          ':active': {
            ...base[':active'],
            backgroundColor: colorBackground,
          },
          backgroundColor: colorBackground,
          color: colorBorder,
          cursor: 'not-allowed',
        }
      }

      return {
        ...myBase,
      }
    },
    placeholder: base => ({
      ...base,
      margin: 0,
      color: colorTextPlaceholder,
    }),
    valueContainer: base => ({
      ...base,
      padding: 0,
    }),
    multiValue: base => ({
      ...base,
      color: colorText,
      backgroundColor: colorBackgroundHue,
    }),
    multiValueLabel: base => ({
      ...base,
      color: colorText,
    }),
    multiValueRemove: base => ({
      ...base,
      color: colorText,
      ':hover': {
        backgroundColor: colorBackgroundHue,
        color: colorPrimary,
      },
    }),
    dropdownIndicator: (base, state) => ({
      ...base,
      padding: 6,
      transition: 'all .2s ease',
      transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : null,
    }),
    menuPlacement: base => ({
      ...base,
    }),
    singleValue: (base, state) => ({
      ...base,
      opacity: state.isDisabled ? 0.5 : 1,
      transition: 'opacity 300ms',
    }),
    singleValueRemove: base => ({
      ...base,
    }),
    clearIndicator: base => ({
      ...base,
      margin: 0,
      color: colorText,
      ':hover': {
        color: colorPrimary,
      },
    }),
    loadingIndicator: base => ({
      ...base,
      color: colorTextPlaceholder,
    }),
  }

  return (
    <Select classNamePrefix="react-select" {...rest} styles={stylesFromTheme} />
  )
}

export default withTheme(StyledSelect)

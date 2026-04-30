/* eslint-disable react/prop-types */

import { withTheme } from 'styled-components'
import { compose } from 'recompose'

const Colorize = Component => {
  const Colorized = ({
    primary,
    secondary,
    warning,
    furniture,
    success,
    error,
    reverse,
    placeholder,
    theme = {},
    ...props
  }) => {
    const color =
      (primary && theme.colorPrimary) ||
      (secondary && theme.colorSecondary) ||
      (furniture && theme.colorFurniture) ||
      (warning && theme.colorWarning) ||
      (success && theme.colorSuccess) ||
      (error && theme.colorError) ||
      (reverse && theme.colorTextReverse) ||
      (placeholder && theme.colorTextPlaceholder) ||
      theme.colorText

    return <Component color={color} theme={theme} {...props} />
  }

  Colorized.propTypes = Object.assign({}, Component.propTypes)
  return Colorized
}

/** @component */
export default compose(withTheme, Colorize)

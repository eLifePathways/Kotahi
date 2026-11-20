import { css } from 'styled-components'
import { get, has } from 'lodash'

const grid = value => props => `calc(${props.theme.gridUnit} * ${value})`

const th = name => props => get(props.theme, name)

const override =
  (name, overrideKey = 'cssOverrides') =>
  props => {
    // Find (props.theme.cssOverrides.) ui.Button
    const target = get(props.theme[overrideKey], name)

    // ui.Button is not there.
    if (!target) return null

    // css`` functions from styled components come in as arrays
    const isStyledCss = Array.isArray(target)
    const hasRoot = has(target, 'Root')

    /*
    ui.Button is there, but there is no ui.Button.Root or ui.Button: css``.

    This also covers the case where you only target children of the component,
    eg. if your override looks like ui.Button = { Icon: css`` }.
    In this case, there would be no overrides for ui.Button, but only for
    ui.Button.Icon, which would have its own override.
  */
    if (!isStyledCss && !hasRoot) return null

    // ui.Button.Root exists
    if (hasRoot) {
      return css`
        ${th(`${overrideKey}.${name}.Root`)};
      `
    }

    // ui.Button: css`` exists
    return css`
      ${th(`${overrideKey}.${name}`)};
    `
  }

export { grid, th, override }

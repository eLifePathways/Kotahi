/* eslint-disable react/prop-types, new-cap */

import styled, { css } from 'styled-components'
import Color from 'color'
import { th, grid } from '@coko/client'

/* eslint-disable-next-line no-unused-vars */
const BadgeDiv = ({ color, children, ...rest }) => (
  <div {...rest}>{children}</div>
)

/** Displays a badge with rounded corners colored according to props.color */
export const ColorBadge = styled(BadgeDiv)`
  border-radius: 8px;
  display: inline-block;
  line-height: 1.1em;
  max-width: 100%;
  ${props =>
    props.color &&
    css`
      background-color: ${props.color};
      ${Color(props.color).isDark()
        ? css`
            color: ${th('colorTextReverse')};
          `
        : ''};
    `}
  overflow-wrap: normal;
  padding: ${grid(0.5)} ${grid(1)};
`

/** Displays the label as a badge colored according to props.color, with small all-caps font */
export const LabelBadge = styled(ColorBadge)`
  align-items: center;
  display: flex;
  font-size: ${th('fontSizeBaseSmall')};
  font-variant: all-small-caps;
  line-height: 1.1em;
  text-overflow: clip;
`

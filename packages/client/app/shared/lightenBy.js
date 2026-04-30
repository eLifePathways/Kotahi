/* eslint-disable new-cap */

/*
  Lighten the shade of a color. Unlike @coko/client's lighten, which applies a simple factor to a color's brightness,
  this lightens the colour relative to its distance from pure white, so that e.g. lightening by 50% will take it half
  way towards white (retaining hue and saturation as much as possible).

  Examples:
  lightenBy('#AAA', 0.7)     gives #CFCFCF
  lightenBy('#AAA', 1)       gives white

  You can supply a valid variable defined in your theme instead:

  eg.
  lightenBy('colorPrimary', 0.3)
  lightenBy('someProperty.customColor', 0.5)
*/

import { get } from 'lodash'
import Color from 'color'

const getColor = (original, props) => {
  const color = get(props.theme, original) || original

  try {
    return Color(color)
    /* eslint-disable-next-line */
  } catch (_) {
    return Color('black')
  }
}

const lightenBy = (original, ratio) => props => {
  const base = getColor(original, props)
  const lightness = base.lightness()
  return base.lightness(lightness + (100 - lightness) * ratio).string()
}

export default lightenBy

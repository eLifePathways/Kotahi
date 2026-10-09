/* eslint-disable new-cap */

import Color from 'color'

const WHITE = '#ffffff'
const DARK_TEXT = '#111111'

/**
 * WCAG level of `color` against `against`: 'AAA', 'AA', '' (fails), or null
 * when either colour can't be parsed (e.g. an empty string).
 */
export const getWcagLevel = (color, against = WHITE) => {
  try {
    return Color(color).level(Color(against))
  } catch {
    return null
  }
}

/** True when `color` meets AA against `against`, or can't be checked yet. */
export const meetsWcagAA = (color, against = WHITE) => {
  const level = getWcagLevel(color, against)
  return level === null || ['AA', 'AAA'].includes(level)
}

/**
 * Whichever of white or dark text has more contrast on `background`.
 * Use for text on a user-chosen background colour, e.g. label badges.
 */
export const getReadableTextColor = (
  background,
  dark = DARK_TEXT,
  light = WHITE,
) => {
  try {
    const bg = Color(background)
    return bg.contrast(Color(dark)) >= bg.contrast(Color(light)) ? dark : light
  } catch {
    return light
  }
}

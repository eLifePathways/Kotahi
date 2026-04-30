/* eslint-disable new-cap */

import Color from 'color'
import lightenBy from '../shared/lightenBy'

const defaultBrandColor1 = '#2fac66'
const defaultBrandColor2 = '#704f79'

const validateInstanceConfigColors = (colorCode, fallbackColor) => {
  try {
    Color(colorCode)
    return colorCode
    /* eslint-disable-next-line */
  } catch (err) {
    return fallbackColor || defaultBrandColor1
  }
}

let colorBrand1 = defaultBrandColor1
let colorBrand2 = defaultBrandColor2

/** Colors are named with round numbers for ease of use. Actual lightness values may differ. */
const color = {
  black: '#000000',
  gray0: '#000000',
  gray5: '#111111', // 7%: colorText
  gray10: '#191919', // 10%
  gray20: '#323232', // 20%
  gray30: '#4F4F4F', // 30%
  // gray35: '#595959', // 35%: colorTextPlaceholder
  gray40: '#666666', // 40%: colorIconPrimary
  gray50: '#888888', // 53%
  gray60: '#A5A5A5', // 65%: near colorBorder:#AAAAAA
  gray70: '#BFBFBF', // 75%
  gray80: '#DEDEDE', // 87%: colorContainerBorder
  gray90: '#E8E8E8', // 91%: colorFurniture
  gray95: '#EEEEEE', // 93%
  gray97: '#F8F8F9', // 97%
  gray99: '#FCFCFD', // 99%
  gray100: '#FFFFFF',
  white: '#FFFFFF',

  text: '#111111',
  textReverse: '#FFFFFF',
  textPlaceholder: '#666666',

  backgroundA: '#FFFFFF',
  backgroundB: '#f9fafb',
  backgroundC: '#f4f5f7',

  brand1: {
    shade50: () => Color(colorBrand1).darken(0.52),
    shade25: () => Color(colorBrand1).darken(0.27),
    shade15: () => Color(colorBrand1).darken(0.17),
    shade10: () => Color(colorBrand1).darken(0.11),
    base: () => colorBrand1,
    tint10: () => lightenBy(colorBrand1, 0.1),
    tint25: () => lightenBy(colorBrand1, 0.26),
    tint50: () => lightenBy(colorBrand1, 0.53),
    tint70: () => lightenBy(colorBrand1, 0.73),
    tint90: () => lightenBy(colorBrand1, 0.93),
  },
  brand2: {
    shade50: () => Color(colorBrand2).darken(0.52),
    shade25: () => Color(colorBrand2).darken(0.27),
    shade15: () => Color(colorBrand2).darken(0.17),
    shade10: () => Color(colorBrand2).darken(0.11),
    base: () => colorBrand2,
    tint10: () => lightenBy(colorBrand2, 0.1),
    tint25: () => lightenBy(colorBrand2, 0.26),
    tint50: () => lightenBy(colorBrand2, 0.53),
    tint70: () => lightenBy(colorBrand2, 0.73),
    tint90: () => lightenBy(colorBrand2, 0.93),
  },

  success: {
    shade50: '#133a0e',
    shade25: '#1b5414',
    shade15: '#25721c',
    shade10: '#2c8a21',
    base: '#329a25',
    tint10: '#3bb32b',
    tint25: '#4fcb3e',
    tint50: '#8ddf83',
    tint70: '#bcedb6',
    tint90: '#e3f8e0',
  },
  warning: {
    shade50: '#6f3f00',
    shade25: '#8e5000',
    shade15: '#ae6200',
    shade10: '#c56f00',
    base: '#e48100',
    tint10: '#f69414',
    tint25: '#f8ae4c',
    tint50: '#f6c88d',
    tint70: '#fadfbe',
    tint90: '#fdf1df',
  },
  error: {
    shade50: '#6f1919',
    shade25: '#8a1e1e',
    shade15: '#a52424',
    shade10: '#bf2828',
    base: '#d22b2b',
    tint10: '#d94747',
    tint25: '#e06969',
    tint50: '#e88e8e',
    tint70: '#f0b4b4',
    tint90: '#f8dcdc',
  },
  additional: {
    blue: '#71AED2',
    purple: '#615CCF',
    aqua: '#7ED3A6',
    green: '#89D46C',
    mustard: '#CCD66E',
  },
}

export const setBrandColors = (color1, color2) => {
  colorBrand1 = validateInstanceConfigColors(color1, defaultBrandColor1)
  colorBrand2 = validateInstanceConfigColors(color2, defaultBrandColor2)
}

setBrandColors()

export default color

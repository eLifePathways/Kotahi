/* eslint-disable new-cap */

import { css } from 'styled-components'
import Color from 'color'

import {
  Action,
  ActionGroup,
  AppBar,
  Button,
  Checkbox,
  // GlobalStyle,
  Radio,
  TextField,
  Menu,
  Logo,
} from './elements'
import lightenBy from '../shared/lightenBy'

// Fonts
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@fontsource/roboto/400-italic.css'

import '@fontsource/spectral-sc'

export const validateColor = colorCode => {
  try {
    Color(colorCode)
    return colorCode
  } catch {
    console.error(`${colorCode} is not a valid color code`)
    return null
  }
}

// Look into a warmer papery theme
// background
// 1. #F9F8F6 • Cotton Rag Paper (The Safe Bet)
// 2. #F7F5F0 • Heavy Cardstock (More Alabaster)
// 3. #FAF9F6 • Clean Washi Paper (Whisper Light)

// font
// warm, dark gray like #2C2A29
// or #333230

// const defaultBrandColor1 = '#3aae2a'
// const defaultBrandColor2 = '#9e9e9e'
const defaultBrandColor1 = '#4a7c59'
const defaultBrandColor2 = '#6b7280'

const borderRadius = '3px'
const colorTextReverse = '#fff'
const colorBackgroundHue = '#f4f5f7'

export const makeTheme = (
  colorBrand1 = defaultBrandColor1,
  colorBrand2 = defaultBrandColor2,
) => {
  const colorPrimaryVeryLight = Color(colorBrand1).lighten(1.4).hex()

  return {
    // DEPRECATED - unused values are commented out
    color: {
      black: '#000000',
      // gray0: '#000000',
      gray5: '#111111', // 7%: colorText
      // gray10: '#191919', // 10%
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
      // gray100: '#FFFFFF',
      white: '#FFFFFF',

      text: '#111111',
      textReverse: '#FFFFFF',
      textPlaceholder: '#666666',

      backgroundA: '#FFFFFF',
      backgroundB: '#f9fafb',
      // backgroundC: '#f4f5f7',
      backgroundC: '#f2f2f2',

      brand1: {
        shade50: Color(colorBrand1).darken(0.52),
        shade25: Color(colorBrand1).darken(0.27),
        // shade15: Color(colorBrand1).darken(0.17),
        // shade10: Color(colorBrand1).darken(0.11),
        base: colorBrand1,
        tint10: lightenBy(colorBrand1, 0.1),
        tint25: lightenBy(colorBrand1, 0.26),
        tint50: lightenBy(colorBrand1, 0.53),
        tint70: lightenBy(colorBrand1, 0.73),
        tint90: lightenBy(colorBrand1, 0.93),
      },
      brand2: {
        // shade50: Color(colorBrand2).darken(0.52),
        // shade25: Color(colorBrand2).darken(0.27),
        // shade15: Color(colorBrand2).darken(0.17),
        // shade10: Color(colorBrand2).darken(0.11),
        base: colorBrand2,
        // tint10: lightenBy(colorBrand2, 0.1),
        // tint25: lightenBy(colorBrand2, 0.26),
        // tint50: lightenBy(colorBrand2, 0.53),
        tint70: lightenBy(colorBrand2, 0.73),
        // tint90: lightenBy(colorBrand2, 0.93),
      },

      success: {
        // shade50: '#133a0e',
        // shade25: '#1b5414',
        // shade15: '#25721c',
        // shade10: '#2c8a21',
        base: '#329a25',
        // tint10: '#3bb32b',
        // tint25: '#4fcb3e',
        // tint50: '#8ddf83',
        // tint70: '#bcedb6',
        // tint90: '#e3f8e0',
      },
      warning: {
        shade50: '#6f3f00',
        // shade25: '#8e5000',
        // shade15: '#ae6200',
        shade10: '#c56f00',
        base: '#e48100',
        // tint10: '#f69414',
        // tint25: '#f8ae4c',
        tint50: '#f6c88d',
        tint70: '#fadfbe',
        tint90: '#fdf1df',
      },
      error: {
        // shade50: '#6f1919',
        // shade25: '#8a1e1e',
        // shade15: '#a52424',
        // shade10: '#bf2828',
        base: '#d22b2b',
        // tint10: '#d94747',
        // tint25: '#e06969',
        // tint50: '#e88e8e',
        // tint70: '#f0b4b4',
        // tint90: '#f8dcdc',
      },
      additional: {
        // blue: '#71AED2',
        // purple: '#615CCF',
        // aqua: '#7ED3A6',
        green: '#89D46C',
        // mustard: '#CCD66E',
      },
    },

    colorBackground: '#FFFFFF',
    colorBackgroundHue,
    colorBorder: '#A5A5A5',
    colorContainerBorder: '#DEDEDE',
    colorDisabled: '#bfbfbf',
    colorError: '#B53930',
    colorFurniture: '#E8E8E8',
    colorIconPrimary: '#666666',
    colorInfo: '#666666',
    colorPrimary: colorBrand1,
    colorPrimaryVeryLight: colorPrimaryVeryLight,
    colorSecondary: colorBrand2,
    colorSecondaryBackground: '#f9fafb',
    colorSuccess: '#008800',
    colorSuccessDark: '#17510F',
    colorSuccessLight: '#d2ffcc',
    colorText: '#111111',
    colorTextHeading: '#111111',
    colorTextPlaceholder: '#666666',
    colorTextReverse: colorTextReverse,
    colorWallpaper: '#f2f2f2',
    colorWarning: '#C18D33',
    colorWarningDark: '#503303',
    colorWarningLight: '#fff9ed',

    // fonts
    fontInterface:
      "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    fontHeading: "'Spectral SC', Georgia, 'Times New Roman', serif",
    fontReading:
      "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    fontWriting:
      "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",

    // https://typescale.com (major second)
    fontSizeBase: '1rem',
    fontSizeBaseSmall: '0.889rem',
    fontSizeBaseSmaller: '0.79rem',
    fontSizeHeading1: '2.027rem',
    fontSizeHeading2: '1.802rem',
    fontSizeHeading3: '1.602rem',
    fontSizeHeading4: '1.424rem',
    fontSizeHeading5: '1.266rem',
    fontSizeHeading6: '1.125rem',

    lineHeightBase: '1.5',
    lineHeightBaseSmall: '1.5',
    lineHeightBaseSmaller: '1.4',
    lineHeightHeading1: '1.1',
    lineHeightHeading2: '1.15',
    lineHeightHeading3: '1.2',
    lineHeightHeading4: '1.25',
    lineHeightHeading5: '1.3',
    lineHeightHeading6: '1.35',

    /* Spacing */
    gridUnit: '4px',

    /* Border */
    borderRadius: borderRadius,
    borderRadiusLarge: '15%',
    borderWidth: '1px', // julien: not 0
    borderStyle: 'solid',

    // Does not exist
    // $borderColor: var($colorFurniture);

    boxShadow200: '0 2px 6px 0 rgb(0 0 0 / 10%)',

    /* Transition */
    // transitionDuration: '0.2s', // TODO -- julien: not 0.05s
    // transitionTimingFunction: 'ease',
    // transitionDelay: '0',
    /* Breakpoints */
    breakpoints: [480, 768, 1000, 1272],

    antComponents: {
      Table: {
        headerBg: colorBrand1,
        headerColor: colorTextReverse,
        headerBorderRadius: borderRadius,

        cellPaddingBlock: '16px',

        headerSortHoverBg: Color(colorBrand1).darken(0.1).hex(),
        headerSortActiveBg: Color(colorBrand1).darken(0.1).hex(),
        headerIconColor: colorTextReverse,
        headerIconHoverColor: colorTextReverse,
        rowSelectedBg: colorPrimaryVeryLight,
        rowHoverBg: colorBackgroundHue,
        rowSelectedHoverBg: Color(colorBackgroundHue).darken(0.08).hex(),
      },
    },

    cssOverrides: {
      Login: {
        Logo,
      },
      ui: {
        Action,
        ActionGroup,
        AppBar,
        Button,
        Checkbox,
        // GlobalStyle,
        Radio,
        TextField,
        Menu,
      },
      Wax: {
        MenuButton: css`
          color: #111;
          margin: 2px;
          padding: 1px;
        `,
        CharactersListComponent: css`
          padding: 0;
        `,
        SpecialCharactersGroup: css`
          padding: 0;
        `,
        GroupTitle: css`
          font-size: 85%;
          letter-spacing: 2pt;
          margin: 4px 12px;
          padding: 0;
          text-transform: uppercase;

          :first-child {
            margin-top: 0;
          }
        `,
        SpecialCharacterButton: css`
          align-items: center;
          background-color: #eee;
          border: none;
          border-radius: 9px;
          color: #333;
          display: flex;
          height: auto;
          justify-content: center;
          margin: 4px;
          min-width: 1px;
          padding: 0 4px 3px;
          width: auto;

          &:hover {
            background-color: ${lightenBy('colorPrimary', 0.4)};
          }

          & span {
            color: inherit;
            display: block;
            font-size: 18px;

            &:hover {
              color: inherit;
            }
          }
        `,
        CounterInfoComponent: css`
          left: -221px;
          position: absolute;
          width: 300px;
        `,
      },
    },
  }
}

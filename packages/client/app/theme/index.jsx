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

const defaultBrandColor1 = '#4a7c59'
const defaultBrandColor2 = '#6b7280'

const borderRadius = '3px'
export const colorBackground = '#FFFFFF'
export const colorText = '#111111'
export const colorTextReverse = '#fff'
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
      gray50: '#6E6E6E', // 43%: passes 4.5:1 as text on white, gray97 and backgroundC
      gray60: '#A5A5A5', // 65%: near colorBorder:#AAAAAA
      gray70: '#BFBFBF', // 75%
      gray80: '#DEDEDE', // 87%: colorContainerBorder
      gray90: '#E8E8E8', // 91%: colorFurniture
      gray95: '#EEEEEE', // 93%
      gray97: '#F8F8F9', // 97%
      gray99: '#FCFCFD', // 99%
      // gray100: '#FFFFFF',
      white: '#FFFFFF',

      text: colorText,
      textReverse: '#FFFFFF',
      textPlaceholder: '#666666',

      backgroundA: colorBackground,
      backgroundB: '#f9fafb',
      // backgroundC: '#f4f5f7',
      backgroundC: '#f2f2f2',

      brand1: {
        // .hex(): styled-components drops Color objects, so these must be strings
        shade50: Color(colorBrand1).darken(0.52).hex(),
        shade25: Color(colorBrand1).darken(0.27).hex(),
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
        base: '#25721c', // text on white: 6:1
        // tint10: '#2f9023',
        // tint25: '#3ebf2f',
        // tint50: '#7fdd74',
        // tint70: '#b6ebaf',
        // tint90: '#ecfaea',
      },
      warning: {
        base: '#a65d00', // text on white: 5:1, on #f9f9f9: 4.8:1
        // tint10: '#c87000',
        // tint25: '#ff8f00',
        tint50: '#ffb85d',
        tint70: '#ffd6a2',
        tint90: '#fff4e7',
      },
      error: {
        base: '#a52424', // text on white: 7.3:1, on colorFurniture: 6:1
        // tint10: '#be2a2a',
        // tint25: '#d64343',
        // tint50: '#e58888',
        // tint70: '#f0bbbb',
        // tint90: '#fbeded',
      },
    },

    colorBackground,
    colorBackgroundHue,
    colorBorder: '#8F8F8F', // 3:1 minimum for input borders (WCAG 1.4.11)
    colorContainerBorder: '#DEDEDE',
    colorDisabled: '#bfbfbf',
    colorError: '#B53930',
    colorFurniture: '#E8E8E8',
    colorIconPrimary: '#666666',
    colorInfo: '#666666',
    colorOverlayBlackHover: 'rgb(0 0 0 / 12%)',
    colorOverlayBlackPressed: 'rgb(0 0 0 / 20%)',
    colorOverlayWhiteHover: 'rgb(255 255 255 / 12%)',
    colorOverlayWhitePressed: 'rgb(255 255 255 / 20%)',
    colorPrimary: colorBrand1,
    colorPrimaryVeryLight: colorPrimaryVeryLight,
    colorSecondary: colorBrand2,
    colorSecondaryBackground: '#f9fafb',
    colorSuccess: '#008800',
    colorSuccessDark: '#17510F',
    colorSuccessLight: '#d2ffcc',
    colorText,
    colorTextHeading: colorText,
    colorTextMuted: '#666666',
    colorTextPlaceholder: '#666666',
    colorTextReverse,
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

    boxShadow: '0 2px 6px 0 rgb(0 0 0 / 10%)',
    boxShadow200: '0 2px 6px 0 rgb(0 0 0 / 10%)', // deprecated

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

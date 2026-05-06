import { css } from 'styled-components'
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
import color, { setBrandColors as internalSetBrandColors } from './color'
import spacing from './spacing'
import typography from './typography'

// Fonts
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import '@fontsource/roboto/900.css'
import '@fontsource/roboto/400-italic.css'

const cokoTheme = {
  color,
  spacing,
  typography,

  /* Colors */
  // TODO Deprecate these in favour of definitions in color.js
  /** @deprecated in favor of color.backgroundA */
  colorBackground: color.backgroundA,
  /** @deprecated in favor of color.backgroundB */
  colorSecondaryBackground: color.backgroundB,
  /** @deprecated in favor of color.brand1.base */
  colorPrimary: color.brand1.base(),
  /** @deprecated in favor of color.brand2.base */
  colorSecondary: color.brand2.base(),
  /** @deprecated in favor of color.gray90 */
  colorFurniture: color.gray90,
  /** @deprecated in favor of color.gray60 */
  colorBorder: color.gray60,
  /** @deprecated in favor of color.backgroundC */
  colorBackgroundHue: color.backgroundC,
  colorSuccess: '#008800',
  colorError: '#FF2D1A',
  /** @deprecated in favor of color.text */
  colorText: color.text,
  /** @deprecated in favor of color.textReverse */
  colorTextReverse: color.textReverse,
  /** @deprecated in favor of color.textPlaceholder */
  colorTextPlaceholder: color.textPlaceholder,
  colorWarning: '#ffc107',
  colorWarningLight: '#fff9ed',
  colorWarningDark: '#503303',
  colorSuccessLight: '#d2ffcc',
  colorSuccessDark: '#17510F',
  /** @deprecated in favor of color.gray40 */
  colorIconPrimary: color.gray40,
  /** @deprecated in favor of color.gray80 */
  colorContainerBorder: color.gray80,

  /* Text variables */

  // fonts
  fontInterface:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontHeading:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontReading:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
  fontWriting:
    "Roboto, -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",

  // font sizes
  fontSizeBase: '16px',
  fontSizeBaseSmall: '14px',
  fontSizeBaseSmaller: '12px',
  fontSizeHeading1: '40px',
  fontSizeHeading2: '36px',
  fontSizeHeading3: '28px',
  fontSizeHeading4: '24px',
  fontSizeHeading5: '20px',
  fontSizeHeading6: '16px',

  // line heights
  lineHeightBase: '24px',
  lineHeightBaseSmall: '16px',
  lineHeightBaseSmaller: '14px',
  lineHeightHeading1: '48px',
  lineHeightHeading2: '40px',
  lineHeightHeading3: '32px',
  lineHeightHeading4: '32px',
  lineHeightHeading5: '24px',
  lineHeightHeading6: '24px',

  /* Spacing */
  gridUnit: '8px',

  /* Border */
  borderRadius: '6px',
  borderWidth: '1px', // julien: not 0
  borderStyle: 'solid',

  // Does not exist
  // $borderColor: var($colorFurniture);

  /* Shadow (for tooltip) */
  boxShadow: {
    inset: 'inset 0px 0px 4px rgb(0 0 0 / 7%)',
    shades: {
      100: '0 2px 6px 0 rgb(0 0 0 / 5%)',
      200: '0 2px 6px 0 rgb(0 0 0 / 10%)',
      300: '0 2px 6px 0 rgb(0 0 0 / 20%)',
    },
  },

  /* Transition */
  // transitionDuration: '0.2s', // TODO -- julien: not 0.05s
  // transitionTimingFunction: 'ease',
  // transitionDelay: '0',
  /* Breakpoints */
  breakpoints: [480, 768, 1000, 1272],

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

export const setBrandColors = (color1 = '#3AAE2A', color2 = '#9e9e9e') => {
  cokoTheme.colorPrimary = color1
  cokoTheme.colorSecondary = color2
  internalSetBrandColors(color1, color2)
}

export { color }
export { spacing as space }

export default cokoTheme

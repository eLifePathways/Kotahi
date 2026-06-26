import 'styled-components'

declare module 'styled-components' {
  export interface DefaultTheme {
    colorBackground: string
    colorSecondaryBackground: string
    colorPrimary: string
    colorSecondary: string
    colorFurniture: string
    colorBorder: string
    colorBackgroundHue: string
    colorSuccess: string
    colorError: string
    colorText: string
    colorTextReverse: string
    colorTextPlaceholder: string
    colorWarning: string
    colorWarningLight: string
    colorWarningDark: string
    colorSuccessLight: string
    colorSuccessDark: string
    colorIconPrimary: string
    colorContainerBorder: string
    colorDisabled: string

    fontInterface: string
    fontHeading: string
    fontReading: string
    fontWriting: string

    fontSizeBase: string
    fontSizeBaseSmall: string
    fontSizeBaseSmaller: string
    fontSizeHeading1: string
    fontSizeHeading2: string
    fontSizeHeading3: string
    fontSizeHeading4: string
    fontSizeHeading5: string
    fontSizeHeading6: string

    lineHeightBase: string
    lineHeightBaseSmall: string
    lineHeightBaseSmaller: string
    lineHeightHeading1: string
    lineHeightHeading2: string
    lineHeightHeading3: string
    lineHeightHeading4: string
    lineHeightHeading5: string
    lineHeightHeading6: string

    gridUnit: string

    borderRadius: string
    borderRadiusLarge: string
    borderWidth: string
    borderStyle: string
  }
}

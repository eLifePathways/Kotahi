import { createGlobalStyle } from 'styled-components'
import { th } from '@coko/client'

export default createGlobalStyle`
  html {
    box-sizing: border-box;
    display: flex;
    min-height: 100%;
    overflow: hidden;
    width: 100%;
  }

  body {
    background-color: ${th('color.backgroundA')};
    box-sizing: border-box;
    color: ${th('color.text')};
    font-family: ${th('fontInterface')}, sans-serif;
    font-size: ${th('fontSizeBase')};
    height: 100%;
    line-height: ${th('lineHeightBase')};
    overscroll-behavior-y: none;
    width: 100%;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  *,
  *::before,
  *::after {
    box-sizing: inherit;
  }

  * {
    border: 0;
    /* -webkit-font-smoothing: auto; */
    font-weight: inherit;
    margin: 0;
    outline: 0;
    padding: 0;
    text-decoration: none;
    text-rendering: optimizelegibility;
  }

  a {
    color: ${th('color.brand1.base')};
    /* stylelint-disable-next-line declaration-no-important */
    text-decoration: none !important;
  }

  strong,
  b {
    font-weight: bold;
  }
`

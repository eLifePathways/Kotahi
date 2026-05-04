import { createGlobalStyle } from 'styled-components'
import { th } from '@coko/client'
import color from '../color'

export default createGlobalStyle`
  html {
    box-sizing: border-box;
    display: flex;
    min-height: 100%;
    overflow: hidden;
    width: 100%;
  }

  body {
    background-color: ${color.backgroundA};
    box-sizing: border-box;
    color: ${color.text};
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
    text-rendering: optimizeLegibility;
  }

  a {
    color: ${color.brand1.base};
  }

  strong,
  b {
    font-weight: bold;
  }
`

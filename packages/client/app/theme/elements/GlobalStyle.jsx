import { css, createGlobalStyle } from 'styled-components'
import { th, grid } from '@coko/client'

const globalStyles = css`
  /* stylelint-disable declaration-no-important */

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
    font-weight: inherit;
    margin: 0;
    outline: 0;
    padding: 0;
    text-decoration: none;
    text-rendering: optimizelegibility;
  }

  a {
    color: ${th('color.brand1.base')};
    text-decoration: none !important;
  }

  strong,
  b {
    font-weight: bold;
  }

  mark {
    background-color: ${th('colorPrimaryVeryLight')};
  }

  /* Ant notifications */

  .ant-notification-notice {
    padding: ${grid(6)} !important;

    > button {
      top: calc(${grid(6)} + 3px) !important;
      right: ${grid(6)} !important;
    }
  }

  .ant-notification-notice-progress::-webkit-progress-value {
    background: ${th('colorBorder')} !important;
  }

  .ant-notification-notice-progress::-moz-progress-bar {
    background: ${th('colorBorder')} !important;
  }

  .ant-notification-notice-with-icon > div.ant-notification-notice-title {
    margin-bottom: 0 !important;
  }

  .ant-notification-notice-success {
    border-left: 5px solid ${th('colorSuccess')};
  }

  .ant-notification-notice-error {
    border-left: 5px solid ${th('colorError')};
  }

  .ant-notification-notice-warning {
    border-left: 5px solid ${th('colorWarning')};
  }

  .ant-notification-notice-info {
    border-left: 5px solid ${th('colorInfo')};
  }
`

export default createGlobalStyle`${globalStyles}`

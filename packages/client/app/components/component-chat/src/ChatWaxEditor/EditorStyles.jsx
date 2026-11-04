/* stylelint-disable string-quotes, declaration-block-no-redundant-longhand-properties */

import styled, { css } from 'styled-components'
import { th } from '@coko/client'
import EditorElements from './layout/EditorElements'

// export const ReadOnlyEditorWithCommentsWrapper = styled.div`
//   display: flex;
//   grid-area: editor;
//   height: 100%;
// `

// these are for the simple editor

export const SimpleGrid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';

  ${props =>
    props.$readonly
      ? css`
          grid-template-rows: 0 1fr;
        `
      : css`
          grid-template-rows: minmax(40px, auto) 1fr;
        `}
`

export const SimpleMenu = styled.div`
  border-top: 1px solid ${th('color.gray90')};
  display: flex;
  flex-wrap: wrap;
  left: -12px;
  user-select: none;
  /* _______________________                                              */
  /* |__100%_MENU__|_______|                                              */
  /* |             | SEND  | <- Send Button                               */
  /* |             | 50px  |                                              */
  /* |---------------------|                                              */
  /* |_____________________|                                              */
  /*     ^-- Adding 50px to 100% Menu Makes it occupy the whole container */
  width: calc(100% + 50px);
  z-index: 1;

  /* TODO: this no longer works! */
  button[title='Special Characters'] + div {
    bottom: 34px;
    left: -372px;
    top: initial;
  }

  /* stylelint-disable-next-line selector-class-pattern */
  .Dropdown-menu {
    bottom: 38px;
    top: initial;
  }

  :focus-within {
    z-index: 1000;
  }
`

export const SimpleEditorDiv = styled.div`
  border: 1px solid ${th('color.gray60')};
  border-radius: ${th('borderRadius')};
  grid-area: editor;
  margin-top: 8px;
  max-height: 60vh;
  overflow: auto;
  padding: 9px;
  width: 100%;

  /* SimpleEditorDiv contains - TWO <divs />   */
  /* 1. Div for Input                          */
  /* 2. Div for Wax Overlay                    */
  /* We select the 2nd div                     */
  /* Place the WaxOverlay above the link icon  */
  /* stylelint-disable-next-line no-descending-specificity */
  & > div:nth-child(2) {
    left: 0;
    top: -60px;
  }

  p {
    /* stylelint-disable-next-line declaration-no-important */
    margin-bottom: 0 !important;
  }

  &:focus-within {
    border: 1px solid ${th('color.brand1.base')};
  }

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const ReadOnlySimpleEditorDiv = styled.div`
  grid-area: editor;
  position: relative;

  /* stylelint-disable-next-line no-descending-specificity */
  & > div {
    height: unset; /* overrides the height: 100% set by Wax, which can be insufficient for content */
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const SimpleInfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  width: 100%;

  div:focus-within > & {
    z-index: 1000;
  }
`

/* this is for ProductionWaxEditor */

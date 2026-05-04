/* stylelint-disable string-quotes, declaration-block-no-redundant-longhand-properties */

import styled, { css } from 'styled-components'
import { th, grid } from '@coko/client'
import waxDefaultStyles from './layout/waxDefaultStyles'
import EditorElements from './layout/EditorElements'
import { color } from '../../../../theme'

// this grid goes around the menu and the editor area beneath it.
export const Grid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';
  grid-template-columns: 100%;
  grid-template-rows: ${props => (props.readonly ? 0 : 'minmax(40px,auto)')} 1fr;
  ${props => props.production && 'min-height: calc(100vh - 108px);'}
  position: relative;
  /* :focus-within {
    z-index: 10000;
  } */
`

export const Menu = styled.div`
  align-items: center;
  background: ${color.backgroundA};
  border: 1px solid ${color.gray60};
  border-bottom: 1px solid ${color.gray90};
  display: flex;
  flex-wrap: wrap;
  font-size: 80%;
  grid-area: menu;
  height: fit-content;
  max-width: 100%;
  min-height: 40px;
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 5;
`

// export const ReadOnlyEditorWithCommentsWrapper = styled.div`
//   display: flex;
//   grid-area: editor;
//   height: 100%;
// `

export const ReadOnlyEditorWithCommentsEditor = styled.div`
  height: 100%;
  min-width: 800px;
  width: 100%;
  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}

  & .comment {
    ${props => props.readOnlyComments && 'pointer-events: none;'}
  }

  & .deletion {
    ${props => props.hideTrackChanges && 'display: none;'}
  }

  & .insertion {
    ${props => props.hideTrackChanges && 'color: initial !important;'}

    & .selected-insertion {
      ${props =>
        props.hideTrackChanges && 'background-color: initial !important;'}
    }
  }
`

export const FullWaxEditorGrid = styled.div`
  display: grid;
  grid-area: editor;
  grid-template-columns: [editorCol] auto [commentsCol] ${props =>
      props.useComments ? 'auto' : 0};
  grid-template-rows: [editorRow] auto [notesRow] auto [infoRow] 40px;
  ${waxDefaultStyles}
  position: relative;
  z-index: 0;
`

export const EditorDiv = styled.div`
  background-color: ${color.backgroundA};
  border: 1px solid ${color.gray60};
  border-radius: 0 0 ${th('borderRadius')} ${th('borderRadius')};
  border-top: none;
  grid-column-start: editorCol;
  grid-row-start: editorRow;
  ${props => !props.hideComments && 'min-width: 800px'};
  overflow: auto;
  padding: 16px;
  position: relative;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  & > div {
    ${props => !props.hideComments && 'max-width: 800px'};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}

  & .ProseMirror .comment {
    ${props => props.hideComments && 'border-bottom-color: transparent;'}
  }
`

export const EditorContainer = styled.div`
  height: 100%;
  width: 100%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;
  }
`

export const FullEditorContainer = styled.div`
  height: 100%;
  min-width: 800px;
  width: 100%;

  .ProseMirror {
    box-shadow: 0 0 8px #ecedf1;
    min-height: 98%;
    padding: ${grid(10)};
    padding: 10px;
  }
`

export const ReadOnlyEditorDiv = styled.div`
  background-color: ${color.backgroundA};
  grid-column-start: editorCol;
  grid-row-start: editorRow;
  /* overflow: auto; */
  padding: 16px;
  position: relative;

  & .ProseMirror .comment {
    border-bottom-color: transparent;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const InfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  grid-column-start: editorCol;
  grid-row-start: infoRow;
  justify-content: flex-end;
  width: 100%;
  z-index: 998;
  /* TODO: when clicked on, this displays a tooltip which is placed incorrectly! */
  /* tooltip expects this to be in bottom right of viewport, which isn't where we always have it. */
  /* position: fixed;
  bottom: 0; */
`

// these are for the simple editor

export const SimpleGrid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';

  ${props =>
    props.readonly
      ? css`
          grid-template-rows: 0 1fr;
        `
      : css`
          grid-template-rows: minmax(40px, auto) 1fr;
        `}
`

export const SimpleMenu = styled.div`
  border-top: 1px solid ${color.gray90};
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

  .Dropdown-menu {
    bottom: 38px;
    top: initial;
  }

  :focus-within {
    z-index: 1000;
  }
`

export const SimpleEditorDiv = styled.div`
  border: 1px solid ${color.gray60};
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
    border: 1px solid ${color.brand1.base};
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

export const ProductionEditorDiv = styled.div`
  display: flex;
  flex-grow: 1;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`
export const EditorArea = styled.div`
  flex-grow: 1;
`

export const SideMenu = styled.div`
  background: ${th('colorBackgroundToolBar')}; /* TODO is this color defined? */
  border-right: ${th('borderWidth')} ${th('borderStyle')} ${color.gray60};
  height: calc(100% - 16px);
  min-width: 250px;
`
export const WaxSurfaceScroll = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  overflow-y: auto;
  position: absolute;
  width: 100%;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

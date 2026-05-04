/* stylelint-disable string-quotes, declaration-no-important, declaration-block-no-redundant-longhand-properties */
/* stylelint-disable color-function-notation, alpha-value-notation */
/* stylelint-disable shorthand-property-no-redundant-values, no-descending-specificity */

import styled, { css } from 'styled-components'
import { th, grid } from '@coko/client'
import waxDefaultStyles from './waxDefaultStyles'
import EditorElements from './EditorElements'
import { color } from '../../../../theme'

// this grid goes around the menu and the editor area beneath it.
export const Grid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';
  grid-template-columns: 100%;
  grid-template-rows: ${props => (props.readonly ? 0 : 'minmax(40px,auto)')} 1fr;
  ${props => props.production && 'min-height: calc(100vh - 142px);'}
  position: relative;
  /* :focus-within {
    z-index: 10000;
  } */
`

export const Menu = styled.div`
  align-items: center;
  background: #fff;
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

  > div:last-child {
    border: ${th('borderWidth')} ${th('borderStyle')} ${th('colorFurniture')};

    /* stylelint-disable-next-line declaration-no-important */
    margin-left: 0 !important;
    margin-right: ${grid(5)};
  }

  > div:nth-last-of-type(-n + 2) {
    margin-left: auto;
  }

  > div[data-name='Tables'] {
    border-right: none;
  }
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
  width: 65%;

  .ProseMirror {
    border-right: 1px solid #ecedf1;
    min-height: 100%;
    padding: 45px 25px 25px 25px;
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
  bottom: -27px;
  position: absolute;
  right: 1px;
  z-index: 999;
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
  align-items: center;
  background: ${color.backgroundA};
  display: flex;
  flex-wrap: wrap;
  grid-area: menu;
  height: fit-content;
  margin: 0 -6px;
  max-width: 100%; /* this is to avoid spillover */
  /* overflow-x: scroll; this is not great! */
  min-height: 40px;
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 1;

  :focus-within {
    z-index: 1000;
  }
`

export const SimpleEditorDiv = styled.div`
  background-color: ${color.gray99};
  border: 1px solid ${color.gray80};
  border-radius: ${th('borderRadius')};
  box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.07);
  grid-area: editor;
  overflow: auto;
  padding: 16px;
  position: relative;

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
  overflow: auto;
  position: relative;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const SimpleInfoContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: flex-end;
  position: relative;
  width: 100%;

  & > div > div::before {
    display: none;
  }

  & > div {
    font-size: 12px;
    line-height: 1em;
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: max-content;
  }

  & > div > div {
    font-size: inherit;
    margin: 0;
  }

  & > div > div > button {
    font-size: inherit;
    height: unset;
    margin: 0;

    span {
      color: ${color.gray50};
      font-size: inherit;
    }
  }

  & > div > div > div {
    margin: 0;
    right: 0;
    top: 18px;

    div {
      border-radius: ${th('borderRadius')};
      font-size: inherit;
      position: unset;

      div {
        font-size: ${th('fontSizeBaseSmall')};
        height: unset;
        line-height: ${th('lineHeightBaseSmall')};
      }
    }
  }

  div:focus-within > & {
    z-index: 1000;
  }
`

// this is for ProductionWaxEditor //

export const ProductionEditorDiv = styled.div`
  background-color: ${color.backgroundA};
  border-bottom-left-radius: 6px;
  box-shadow: ${({ theme }) => theme.boxShadow.shades[200]};
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
  height: calc(100vh - 182px);
`

export const SideMenu = styled.div`
  background: ${th('colorBackgroundToolBar')}; /* TODO is this color defined? */
  border-right: ${th('borderWidth')} ${th('borderStyle')} ${color.gray60};
  height: 100%;
  min-width: 200px; /* We can shrink this now if we want! */
`
export const WaxSurfaceScroll = styled.div`
  box-sizing: border-box;
  display: flex;
  height: 100%;
  overflow-y: auto;
  position: relative;
  width: 100%;

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

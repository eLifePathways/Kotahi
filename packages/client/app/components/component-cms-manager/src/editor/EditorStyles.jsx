/* stylelint-disable string-quotes, declaration-block-no-redundant-longhand-properties */

import styled from 'styled-components'
import { th } from '@coko/client'
import waxDefaultStyles from '../../../wax-collab/src/layout/waxDefaultStyles'
import EditorElements from '../../../wax-collab/src/layout/EditorElements'
import { color } from '../../../../theme'

// this grid goes around the menu and the editor area beneath it.
export const Grid = styled.div`
  display: grid;
  grid-template-areas: 'menu' 'editor';
  grid-template-columns: 100%;
  grid-template-rows: ${props => (props.readonly ? 0 : 'minmax(40px,auto)')} 1fr;
  height: 100%;
  ${props => props.production && 'min-height: calc(100vh - 108px);'}
  position: relative;
`

export const Menu = styled.div`
  align-items: center;
  background: #fff;
  border: 1px solid ${color.gray80};
  display: flex;
  flex-wrap: wrap;
  font-size: 12.8px;
  grid-area: menu;
  height: fit-content;
  max-width: 100%;
  min-height: 40px;
  position: sticky;
  top: -20px;
  user-select: none;
  z-index: 5;

  & > div {
    /* height: 36px; */
  }
`

export const FullWaxEditorGrid = styled.div`
  grid-area: editor;
  grid-template-columns: [editorCol] auto [commentsCol] ${props =>
      props.useComments ? 'auto' : 0};
  grid-template-rows: [editorRow] auto [notesRow] auto [infoRow] 40px;
  height: 18rem;
  ${waxDefaultStyles}
  position: relative;
  z-index: 0;
`

export const EditorDiv = styled.div`
  background-color: ${th('colorBackground')};
  border: 1px solid ${color.gray80};
  border-width: 0 1px 1px;
  grid-column-start: editorCol;
  grid-row-start: editorRow;
  height: 100%;
  ${props => !props.hideComments && 'min-width: 800px'};
  overflow: auto;
  padding: 5px;
  position: relative;

  .error & {
    border: 1px solid ${th('colorError')};
  }

  & > div {
    ${props => !props.hideComments && 'max-width: 800px'};
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}

  & .ProseMirror {
    height: inherit;
  }
`

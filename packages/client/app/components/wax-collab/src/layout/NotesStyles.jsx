import styled from 'styled-components'
import { grid } from '@coko/client'
import EditorElements from './EditorElements'
import { color } from '../../../../theme'

export const NotesAreaContainer = styled.div`
  /* stylelint-disable selector-class-pattern */
  background: ${color.backgroundA};
  bottom: ${grid(-2)};
  box-shadow: 0 ${grid(-0.3)} ${grid(0.5)} ${grid(-0.2)} gray;
  display: flex; /* this is so that comments on notes appear beside the notes */
  grid-column-start: editorCol;
  grid-row-start: notesRow;
  /* height: 20vh;
  overflow-y: scroll;
  position: sticky; */
  width: 100%;

  &.productionnotes {
    grid-column-start: initial;
    grid-row-start: initial;
    position: relative;
  }

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const ReadOnlyNotesAreaContainer = styled.div`
  background: ${color.backgroundA};
  border-top: 1px solid ${color.gray90};
  grid-column-start: editorCol;
  grid-row-start: notesRow;
  width: 100%;

  .ProseMirror {
    display: inline;
  }

  /* stylelint-disable-next-line order/properties-alphabetical-order */
  ${EditorElements}
`

export const NotesContainer = styled.div`
  counter-reset: footnote-view;
  display: flex;
  flex-direction: column;
  padding-bottom: ${grid(4)};
  padding-left: 32px;
  width: calc(100% - ${grid(4)});

  & > div > div > div:first-child {
    margin-top: 4px; /* fix alignment of numbers */
  }
`

export const NotesHeading = styled.div`
  color: ${color.brand1.base};
  margin: 3px 7px 3px -25px;
  text-transform: uppercase;
`

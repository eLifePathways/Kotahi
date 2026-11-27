import type { Command, EditorState } from 'prosemirror-state'

import { blockActive, setBlockType } from './helpers'
import type { WaxFeature } from '../editor'

export const setParagraph: Command = (state, dispatch) =>
  setBlockType(state.schema.nodes.paragraph, { class: 'paragraph' })(
    state,
    dispatch,
  )

export const isParagraphActive = (state: EditorState): boolean =>
  blockActive(state.schema.nodes.paragraph)(state)

export const canSetParagraph = (state: EditorState): boolean =>
  setBlockType(state.schema.nodes.paragraph)(state)

const paragraph: WaxFeature = {
  name: 'paragraph',
}

export default paragraph

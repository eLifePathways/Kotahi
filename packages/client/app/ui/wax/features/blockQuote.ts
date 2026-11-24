import type { NodeSpec } from 'prosemirror-model'
import { wrapIn } from 'prosemirror-commands'
import {
  NodeSelection,
  type Command,
  type EditorState,
} from 'prosemirror-state'

import type { WaxFeature } from './types'

const blockQuoteNode: NodeSpec = {
  content: 'block+',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: 'blockquote' }],
  toDOM() {
    return ['blockquote', 0]
  },
}

export const wrapInBlockQuote: Command = (state, dispatch) =>
  wrapIn(state.schema.nodes.blockquote)(state, dispatch)

export const canWrapInBlockQuote = (state: EditorState): boolean =>
  wrapIn(state.schema.nodes.blockquote)(state)

export const isBlockQuoteActive = (state: EditorState): boolean => {
  const { $from, to } = state.selection
  const same = $from.sharedDepth(to)
  if (same === 0) return false
  const node = NodeSelection.create(state.doc, $from.before(same))
  return node.$from.parent.hasMarkup(state.schema.nodes.blockquote)
}

const blockQuote: WaxFeature = {
  name: 'blockQuote',
  nodes: { blockquote: blockQuoteNode },
}

export default blockQuote

import { Fragment, type Node, type NodeSpec } from 'prosemirror-model'
import { Plugin, type Command } from 'prosemirror-state'
import type { NodeView } from 'prosemirror-view'
import { uuid } from '@coko/client'

import type { WaxFeature } from './types'

const footNoteNode: NodeSpec = {
  group: 'notes inline',
  content: 'inline*',
  inline: true,
  atom: true,
  attrs: {
    id: { default: '' },
  },
  toDOM: node => ['footnote', node.attrs, 0],
  parseDOM: [
    {
      tag: 'footnote',
      getAttrs(dom: HTMLElement): Record<string, unknown> {
        return {
          id: dom.getAttribute('id'),
        }
      },
    },
  ],
}

export const insertNote: Command = (state, dispatch) => {
  const { empty, $from, $to } = state.selection
  let content = Fragment.empty

  if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
    content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)

  const footnote = state.schema.nodes.footnote.create({ id: uuid() }, content)

  if (dispatch) dispatch(state.tr.replaceSelectionWith(footnote))
  return true
}

export type Note = { id: string; pos: number; number: number; node: Node }

export const findNotes = (doc: Node): Note[] => {
  const result: Note[] = []

  doc.descendants((node, pos) => {
    if (node.type.name === 'footnote')
      result.push({ id: node.attrs.id, pos, number: result.length + 1, node })
  })

  return result
}

const footnoteMarker = (node: Node): NodeView => {
  const dom = document.createElement('footnote')
  dom.setAttribute('id', node.attrs.id)
  return { dom }
}

const notes: WaxFeature = {
  name: 'notes',
  nodes: { footnote: footNoteNode },
  plugins: () => ({
    footnoteMarker: new Plugin({
      props: { nodeViews: { footnote: footnoteMarker } },
    }),
  }),
}

export default notes

import type { Command, EditorState } from 'prosemirror-state'

import { setBlockType } from './helpers'
import type { WaxFeature, WaxNodeSpec } from './types'

export type HeadingLevel = 2 | 3 | 4 | 5 | 6

const headingNode = (level: HeadingLevel): WaxNodeSpec => ({
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [{ tag: `h${level}` }],
  toDOM(hook, next): void {
    hook.value = [`h${level}`, {}, 0]
    next()
  },
})

const nodeName = (level: HeadingLevel): string => `heading${level}`

export const setHeading =
  (level: HeadingLevel): Command =>
  (state, dispatch) =>
    setBlockType(state.schema.nodes[nodeName(level)])(state, dispatch)

export const canSetHeading =
  (level: HeadingLevel) =>
  (state: EditorState): boolean =>
    setBlockType(state.schema.nodes[nodeName(level)])(state)

export const isHeadingActive =
  (level: HeadingLevel) =>
  (state: EditorState): boolean => {
    const { from, to } = state.selection
    let active = false

    state.doc.nodesBetween(from, to, node => {
      if (node.type.name === nodeName(level)) active = true
    })

    return active
  }

const headings: WaxFeature = {
  name: 'headings',
  waxNodes: {
    heading2: headingNode(2),
    heading3: headingNode(3),
    heading4: headingNode(4),
    heading5: headingNode(5),
    heading6: headingNode(6),
  },
}

export default headings

import type { Command, EditorState } from 'prosemirror-state'

import { blockActive, findChildrenByType, setBlockType } from './helpers'
import type { WaxFeature, WaxNodeSpec } from '../editor'

const titleNode: WaxNodeSpec = {
  attrs: {
    level: { default: 1 },
  },
  content: 'inline*',
  group: 'block',
  defining: true,
  parseDOM: [
    {
      tag: 'h1',
      attrs: { level: 1 },
    },
  ],
  toDOM(hook, next) {
    hook.value = [`h${hook.node.attrs.level}`, {}, 0]
    next()
  },
}

export const findTitle = (state: EditorState): string | null => {
  const [title] = findChildrenByType(state.doc, state.schema.nodes.title, true)

  return title ? title.node.textContent : null
}

export const setTitle: Command = (state, dispatch) =>
  setBlockType(state.schema.nodes.title, { level: 1 })(state, dispatch)

export const isTitleActive = (state: EditorState): boolean =>
  blockActive(state.schema.nodes.title)(state)

export const canSetTitle = (state: EditorState): boolean => {
  const { $from, $to } = state.selection
  return $from.parent === $to.parent && findTitle(state) === null
}

const titleEnter: Command = state => {
  const { nodes } = state.schema
  const { from } = state.selection
  if (setBlockType(nodes.title)(state)) return false

  const [found, ...others] = findChildrenByType(state.doc, nodes.title, true)

  return (
    !!found &&
    others.length === 0 &&
    from > found.pos + 1 &&
    from < found.pos + found.node.nodeSize - 1
  )
}

const title: WaxFeature = {
  name: 'title',
  waxNodes: { title: titleNode },
  shortcuts: { Enter: titleEnter },
}

export default title

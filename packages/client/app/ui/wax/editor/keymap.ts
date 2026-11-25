import {
  baseKeymap,
  chainCommands,
  deleteSelection,
  exitCode,
  joinBackward,
  selectNodeBackward,
  selectParentNode,
} from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import { splitListItem } from 'prosemirror-schema-list'
import {
  NodeSelection,
  TextSelection,
  type Command,
  type Plugin,
} from 'prosemirror-state'

import { findChildrenByType, setBlockType } from '../features/helpers'

const backspace = chainCommands(
  deleteSelection,
  joinBackward,
  selectNodeBackward,
)

const questionContainers = [
  'fill_the_gap_container',
  'multiple_drop_down_container',
  'numerical_answer_container',
  'essay_container',
  'matching_container',
]

const backspaceKey: Command = (state, dispatch, view) => {
  const { $from, $to } = state.selection
  const { nodeBefore } = $from

  if (nodeBefore && nodeBefore.type.name === 'math_inline') {
    const index = $from.index($from.depth)
    const $before = state.doc.resolve($from.posAtIndex(index - 1))
    dispatch(state.tr.setSelection(new NodeSelection($before)))
    return true
  }

  state.doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    if (questionContainers.includes(node.type.name))
      dispatch(state.tr.delete(from, from + node.nodeSize))
  })

  state.doc.nodesBetween($from.pos, $to.pos, node => {
    if (node.type.name === 'math_display') {
      const $start = state.tr.doc.resolve(state.tr.selection.$anchor.start())
      const $end = state.tr.doc.resolve(state.tr.selection.$anchor.end())
      dispatch(state.tr.setSelection(new TextSelection($start, $end)))
    }
  })

  return backspace(
    state,
    tr => dispatch(tr.setMeta('inputType', 'backwardsDelete')),
    view,
  )
}

const enterKey: Command = (state, dispatch) => {
  const { $from, to, from } = state.selection
  const { nodes } = state.schema

  if (state.doc.resolve(from).parent.type.name === 'figcaption') return true

  const selected = (state.selection as NodeSelection).node

  if (selected && selected.type.name === 'image') {
    const pos = $from.before($from.sharedDepth(to))
    dispatch(state.tr.setSelection(NodeSelection.create(state.doc, pos)))
    return true
  }

  if (nodes.list_item && splitListItem(nodes.list_item)(state)) {
    splitListItem(nodes.list_item)(state, dispatch)
    return true
  }

  if (nodes.title && !setBlockType(nodes.title)(state)) {
    const title = findChildrenByType(state.doc, nodes.title, true)

    if (
      title.length === 1 &&
      from > title[0].pos + 1 &&
      from < title[0].pos + title[0].node.nodeSize - 1
    )
      return true
  }

  return false
}

const undoKey: Command = (state, dispatch, view) =>
  undo(state, tr => dispatch(tr.setMeta('inputType', 'Undo')), view)

const redoKey: Command = (state, dispatch, view) =>
  redo(state, tr => dispatch(tr.setMeta('inputType', 'Redo')), view)

const insertBreak: Command = (state, dispatch) => {
  const br = state.schema.nodes.hard_break.create()
  dispatch(state.tr.replaceSelectionWith(br).scrollIntoView())
  return true
}

const defaultKeys = (): Record<string, Command> => ({
  'Mod-z': undoKey,
  'Shift-Mod-z': redoKey,
  Backspace: backspaceKey,
  'Mod-y': redoKey,
  Escape: selectParentNode,
  'Mod-Enter': chainCommands(exitCode, insertBreak),
  'Shift-Enter': chainCommands(exitCode, insertBreak),
  'Ctrl-Enter': chainCommands(exitCode, insertBreak),
  Enter: enterKey,
})

const createKeymap = (shortcuts: Record<string, Command>[]): Plugin => {
  const keys = Object.assign(defaultKeys(), ...shortcuts)

  Object.entries(baseKeymap).forEach(([key, command]) => {
    keys[key] = keys[key] ? chainCommands(keys[key], command) : command
  })

  return keymap(keys)
}

export default createKeymap

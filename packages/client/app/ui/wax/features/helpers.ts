import { toggleMark } from 'prosemirror-commands'
import type { Attrs, Mark, MarkType, Node, NodeType } from 'prosemirror-model'
import type {
  Command,
  EditorState,
  Plugin,
  Transaction,
} from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export type NodeWithPos = { node: Node; pos: number }

export type MarkRange = { from: number; to: number; attrs: Attrs }

export const setBlockType =
  (nodeType: NodeType, attrs: Attrs = {}): Command =>
  (state, dispatch) => {
    const { tr } = state
    const { from, to } = state.selection

    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return
      let applicable = false

      if (node.type === nodeType) {
        applicable = true
      } else {
        const $pos = state.doc.resolve(pos)
        const index = $pos.index()
        applicable = $pos.parent.canReplaceWith(index, index + 1, nodeType)
      }

      if (applicable) {
        tr.setBlockType(from, to, nodeType, { ...node.attrs, ...attrs })
      }
    })

    if (!tr.steps.length) return false
    if (dispatch) dispatch(tr.scrollIntoView())
    return true
  }

export const blockActive =
  (nodeType: NodeType, attrs: Attrs = {}) =>
  (state: EditorState): boolean => {
    const { from, to } = state.selection
    let isActive = false

    state.doc.nodesBetween(from, to, node => {
      if (!node.isTextblock || node.hasMarkup(nodeType, attrs)) return
      if (node.type === nodeType) isActive = true
    })

    return isActive
  }

export const markActive =
  (type: MarkType) =>
  (state: EditorState): boolean => {
    const { from, $from, to, empty } = state.selection

    return empty
      ? !!type.isInSet(state.storedMarks || $from.marks())
      : state.doc.rangeHasMark(from, to, type)
  }

export const canInsert =
  (type: NodeType) =>
  (state: EditorState): boolean => {
    const { $from } = state.selection

    for (let d = $from.depth; d >= 0; d -= 1) {
      const index = $from.index(d)
      if ($from.node(d).canReplaceWith(index, index, type)) return true
    }

    return false
  }

export const createTable = (
  { rows, cols }: { rows: number; cols: number },
  state: EditorState,
  dispatch: (tr: Transaction) => void,
): void => {
  const { nodes } = state.schema
  const cells = Array.from({ length: cols }, () =>
    nodes.table_cell.createAndFill(),
  )
  const tableRows = Array.from({ length: rows }, () =>
    nodes.table_row.createAndFill(null, cells),
  )

  dispatch(
    state.tr.replaceSelectionWith(
      nodes.table_body.createAndFill(null, tableRows),
    ),
  )
}

export const createLink = (
  state: EditorState,
  dispatch: (tr: Transaction) => void,
): void => {
  const { $from, $to } = state.selection

  dispatch(
    state.tr
      .setMeta('addToHistory', false)
      .addMark(
        $from.pos,
        $to.pos,
        state.schema.marks.link.create({ href: '' }),
      ),
  )
}

export const isOnSameTextBlock = (state: EditorState): boolean => {
  const { $from, $to, from, to } = state.selection
  return from !== to && $from.parent === $to.parent && $from.parent.isTextblock
}

export const simulateKey = (
  view: EditorView,
  keyCode: number,
  key: string,
): boolean => {
  const event = document.createEvent('Event') as KeyboardEvent
  event.initEvent('keydown', true, true)
  Object.defineProperties(event, {
    keyCode: { value: keyCode },
    key: { value: key },
    code: { value: key },
  })

  return !!view.someProp('handleKeyDown', f => f(view, event))
}

export const toggleMarkByName =
  (markName: string): Command =>
  (state, dispatch) =>
    toggleMark(state.schema.marks[markName])(state, dispatch)

export const isMarkActive =
  (markName: string) =>
  (state: EditorState): boolean =>
    markActive(state.schema.marks[markName])(state)

export const hasSelection = (state: EditorState): boolean =>
  state.selection.from !== null

export const keyedPlugins = (
  prefix: string,
  plugins: Plugin[],
): Record<string, Plugin> =>
  Object.fromEntries(plugins.map((plugin, i) => [`${prefix}-${i}`, plugin]))

export const findChildren = (
  node: Node,
  predicate: (child: Node) => boolean,
  descend = true,
): NodeWithPos[] => {
  const result: NodeWithPos[] = []

  node.descendants((child, pos) => {
    if (predicate(child)) result.push({ node: child, pos })
    return descend
  })

  return result
}

export const findChildrenByType = (
  node: Node,
  nodeType: NodeType,
  descend = true,
): NodeWithPos[] =>
  findChildren(node, child => child.type === nodeType, descend)

export const findInlineNodes = (node: Node, descend = true): NodeWithPos[] =>
  findChildren(node, child => child.isInline, descend)

export const findMark = (
  state: EditorState,
  markType: MarkType,
  toArr = false,
):
  | (MarkRange & { contained: boolean })
  | (MarkRange & { contained: boolean })[]
  | undefined => {
  const { $from, $to } = state.selection
  const fromMark = $from.marks().find(mark => mark.type === markType)
  const toMark = $to.marks().find(mark => mark.type === markType)
  const found: (MarkRange & { contained: boolean })[] = []

  state.doc.nodesBetween($from.pos, $to.pos, (node, from) => {
    const mark: Mark | undefined = node.marks?.find(m => m.type === markType)

    if (mark) {
      found.push({
        from,
        to: from + node.nodeSize,
        attrs: mark.attrs,
        contained: !fromMark || !toMark || fromMark === toMark,
      })
    }
  })

  return toArr ? found : found.at(-1)
}

export const findMarkPosition = (
  state: EditorState,
  initialPos: number,
  markType: string,
): MarkRange | null => {
  const $pos = state.doc.resolve(initialPos)
  const { parent } = $pos
  const start = parent.childAfter($pos.parentOffset)
  if (!start.node) return null
  const mark = start.node.marks.find(m => m.type.name === markType)

  let startIndex = $pos.index()
  let startPos = $pos.start() + start.offset

  while (startIndex > 0 && mark.isInSet(parent.child(startIndex - 1).marks)) {
    startIndex -= 1
    startPos -= parent.child(startIndex).nodeSize
  }

  let endIndex = $pos.index() + 1
  let endPos = $pos.start() + start.offset + start.node.nodeSize

  while (
    endIndex < parent.childCount &&
    mark.isInSet(parent.child(endIndex).marks)
  ) {
    endPos += parent.child(endIndex).nodeSize
    endIndex += 1
  }

  return { from: startPos, to: endPos, attrs: mark.attrs }
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const findMatches = (
  doc: Node,
  searchValue: string,
  matchCase: boolean,
): { from: number; to: number }[] => {
  const all: NodeWithPos[] = []
  doc.descendants((node, pos) => {
    all.push({ node, pos })
  })

  for (let i = all.length - 1; i >= 0; i -= 1) {
    if ((all[i].node.type.spec.group ?? '').split(' ').includes('notes'))
      all.splice(i + 1, all[i].node.childCount)
  }

  const merged: { text: string; pos: number }[] = []
  let index = 0

  all.forEach(({ node, pos }) => {
    if (node.isText) {
      merged[index] = merged[index]
        ? { text: merged[index].text + node.text, pos: merged[index].pos }
        : { text: node.text ?? '', pos }
    } else {
      index += 1
    }
  })

  const results: { from: number; to: number }[] = []

  merged.forEach(entry => {
    if (!entry) return
    const search = RegExp(escapeRegExp(searchValue), matchCase ? 'gu' : 'gui')
    let match = search.exec(entry.text)

    while (match && match[0] !== '') {
      results.push({
        from: entry.pos + match.index,
        to: entry.pos + match.index + match[0].length,
      })
      match = search.exec(entry.text)
    }
  })

  return results
}

const parseStringArray = (value?: string): unknown[] => {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const parseFormatList = (value?: string): string[] =>
  parseStringArray(value).filter((f): f is string => typeof f === 'string')

export const parseTracks = (value?: string): Record<string, unknown>[] =>
  parseStringArray(value).filter(
    (track): track is Record<string, unknown> =>
      !!track &&
      typeof track === 'object' &&
      'user' in track &&
      'username' in track &&
      'date' in track,
  )

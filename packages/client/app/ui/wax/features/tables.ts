import type { Attrs, Node, NodeSpec } from 'prosemirror-model'
import {
  Plugin,
  PluginKey,
  type Command,
  type EditorState,
} from 'prosemirror-state'
import {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  columnResizing,
  deleteColumn,
  deleteRow,
  goToNextCell,
  isInTable as pmIsInTable,
  mergeCells,
  splitCell,
  tableEditing,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
} from 'prosemirror-tables'
import { Decoration, DecorationSet, type EditorProps } from 'prosemirror-view'

import { canInsert, createTable } from './helpers'
import type { WaxFeature } from './types'

export {
  addColumnAfter,
  addColumnBefore,
  addRowAfter,
  addRowBefore,
  deleteColumn,
  deleteRow,
  mergeCells,
  splitCell,
  toggleHeaderCell,
  toggleHeaderColumn,
  toggleHeaderRow,
}

const styleAttr = { style: { default: null } }

const getCellAttrs = (dom: HTMLElement | string): Attrs => {
  if (typeof dom === 'string') return {}

  const widthAttr = dom.getAttribute('data-colwidth')
  const widths =
    widthAttr && /^\d+(,\d+)*$/.test(widthAttr)
      ? widthAttr.split(',').map(s => Number(s))
      : null
  const colspan = Number(dom.getAttribute('colspan') || 1)

  return {
    colspan,
    rowspan: Number(dom.getAttribute('rowspan') || 1),
    colwidth: widths && widths.length === colspan ? widths : null,
  }
}

const setCellAttrs = (node: Node): Attrs => {
  const attrs: Record<string, unknown> = {}
  if (node.attrs.colspan !== 1) attrs.colspan = node.attrs.colspan
  if (node.attrs.rowspan !== 1) attrs.rowspan = node.attrs.rowspan
  if (node.attrs.colwidth)
    attrs['data-colwidth'] = node.attrs.colwidth.join(',')
  return attrs
}

const cellAttrs = {
  colspan: { default: 1 },
  rowspan: { default: 1 },
  colwidth: { default: null },
  ...styleAttr,
}

const table: NodeSpec = {
  attrs: styleAttr,
  content: 'table_caption? table_body*',
  tableRole: 'wrapper',
  isolating: true,
  group: 'block',
  parseDOM: [{ tag: 'table' }],
  toDOM: node => ['table', node.attrs, 0],
}

const tableCaption: NodeSpec = {
  attrs: styleAttr,
  content: 'block+',
  tableRole: 'caption',
  isolating: true,
  parseDOM: [{ tag: 'caption' }],
  toDOM: node => ['caption', node.attrs, 0],
}

const tableBody: NodeSpec = {
  attrs: styleAttr,
  content: 'table_row+',
  tableRole: 'table',
  isolating: true,
  parseDOM: [{ tag: 'tbody' }],
  toDOM: node => ['tbody', node.attrs, 0],
}

const tableRow: NodeSpec = {
  attrs: styleAttr,
  content: '(table_cell | table_header)*',
  tableRole: 'row',
  parseDOM: [{ tag: 'tr' }],
  toDOM: node => ['tr', node.attrs, 0],
}

const tableCell: NodeSpec = {
  content: 'block+',
  attrs: cellAttrs,
  tableRole: 'cell',
  isolating: true,
  parseDOM: [{ tag: 'td', getAttrs: getCellAttrs }],
  toDOM: node => ['td', setCellAttrs(node), 0],
}

const tableHeader: NodeSpec = {
  content: 'block+',
  attrs: cellAttrs,
  tableRole: 'header_cell',
  isolating: true,
  parseDOM: [{ tag: 'th', getAttrs: getCellAttrs }],
  toDOM: node => ['th', setCellAttrs(node), 0],
}

type WrapperPosition = {
  node: Node
  start: number
  before: number
  after: number
}

const findWrapper = (state: EditorState): WrapperPosition | null => {
  const { $anchor } = state.selection

  for (let d = $anchor.depth; d > 0; d -= 1) {
    const node = $anchor.node(d)

    if (node.type.spec.tableRole === 'wrapper') {
      return {
        node,
        start: $anchor.start(d),
        before: $anchor.before(d),
        after: $anchor.after(d),
      }
    }
  }

  return null
}

const hasCaption = (node: Node): boolean =>
  node.firstChild?.type.spec.tableRole === 'caption'

export const addCaption: Command = (state, dispatch) => {
  const wrapper = findWrapper(state)
  if (!wrapper || hasCaption(wrapper.node)) return false

  if (dispatch) {
    const caption = state.schema.nodes.table_caption.createAndFill()
    dispatch(state.tr.insert(wrapper.start, caption))
  }

  return true
}

export const deleteCaption: Command = (state, dispatch) => {
  const wrapper = findWrapper(state)
  if (!wrapper || !hasCaption(wrapper.node)) return false

  if (dispatch) {
    const size = wrapper.node.firstChild.nodeSize
    dispatch(state.tr.delete(wrapper.start, wrapper.start + size))
  }

  return true
}

export const deleteTable: Command = (state, dispatch) => {
  const wrapper = findWrapper(state)
  if (!wrapper) return false

  if (dispatch) {
    dispatch(state.tr.delete(wrapper.before, wrapper.after).scrollIntoView())
  }

  return true
}

export const insertTable =
  (rows: number, cols: number): Command =>
  (state, dispatch) => {
    if (!dispatch) return true
    createTable({ rows, cols }, state, dispatch)
    return true
  }

export const canInsertTable = (state: EditorState): boolean =>
  canInsert(state.schema.nodes.table)(state)

export const isInTable = (state: EditorState): boolean => pmIsInTable(state)

export const nextCell: Command = goToNextCell(1)

export const previousCell: Command = goToNextCell(-1)

const columnWidthsFor = (wrapper: Node): string[] => {
  let body: Node | null = null

  wrapper.forEach(child => {
    if (!body && child.type.spec.tableRole === 'table') body = child
  })

  const row = (body as Node | null)?.firstChild
  if (!row) return []

  const widths: string[] = []

  row.forEach(cell => {
    const { colspan, colwidth } = cell.attrs

    for (let j = 0; j < colspan; j += 1) {
      const width = colwidth && colwidth[j]
      widths.push(width ? `${width}px` : '')
    }
  })

  return widths
}

const colgroupWidget = (pos: number, widths: string[]): Decoration =>
  Decoration.widget(
    pos,
    () => {
      const colgroup = document.createElement('colgroup')

      widths.forEach(width => {
        const col = document.createElement('col')
        col.style.width = width
        colgroup.appendChild(col)
      })

      return colgroup
    },
    { side: -1, key: `colgroup-${widths.join(',')}` },
  )

const columnWidthDecorations = (doc: Node): DecorationSet => {
  const decorations: Decoration[] = []

  doc.descendants((node, pos) => {
    if (node.type.spec.tableRole !== 'wrapper') return true
    decorations.push(colgroupWidget(pos + 1, columnWidthsFor(node)))
    return false
  })

  return DecorationSet.create(doc, decorations)
}

const columnWidthsKey = new PluginKey<DecorationSet>('tableColumnWidths')

const columnWidths = (): Plugin<DecorationSet> =>
  new Plugin<DecorationSet>({
    key: columnWidthsKey,
    state: {
      init: (_, state): DecorationSet => columnWidthDecorations(state.doc),
      apply: (tr, previous): DecorationSet =>
        tr.docChanged ? columnWidthDecorations(tr.doc) : previous,
    },
    props: {
      decorations: (state): DecorationSet => columnWidthsKey.getState(state),
    },
  })

const withoutArrowUp = (plugin: Plugin): Plugin => {
  const props = plugin.props as EditorProps
  const { handleKeyDown } = props

  props.handleKeyDown = function handleTableKeys(view, event): boolean {
    const plainArrowUp =
      event.key === 'ArrowUp' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey

    return plainArrowUp ? false : handleKeyDown.call(this, view, event)
  }

  return plugin
}

const tables: WaxFeature = {
  name: 'tables',
  nodes: {
    table,
    table_caption: tableCaption,
    table_body: tableBody,
    table_row: tableRow,
    table_cell: tableCell,
    table_header: tableHeader,
  },
  shortcuts: {
    Tab: nextCell,
    'Shift-Tab': previousCell,
  },
  plugins: () => ({
    tableColumnResizing: columnResizing({ View: null }),
    tableEditing: withoutArrowUp(tableEditing()),
    tableColumnWidths: columnWidths(),
  }),
}

export default tables

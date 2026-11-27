import {
  DOMParser,
  DOMSerializer,
  Fragment,
  NodeRange,
  Slice,
  type Node,
  type NodeType,
  type ResolvedPos,
} from 'prosemirror-model'
import {
  Plugin,
  PluginKey,
  type Command,
  type EditorState,
  type Transaction,
} from 'prosemirror-state'
import { ReplaceAroundStep, canJoin, liftTarget } from 'prosemirror-transform'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { uuid } from '@coko/client'

import { setBlockType } from './helpers'
import type { WaxFeature, WaxNodeSpec } from '../editor'

const referenceNode: WaxNodeSpec = {
  content: 'inline*',
  group: 'block',
  priority: 0,
  defining: true,
  attrs: {
    class: { default: 'ref' },
    refId: { default: '' },
    valid: { default: false },
    needsReview: { default: false },
    needsValidation: { default: true },
    structure: { default: '{}' },
    originalText: { default: '' },
    possibleStructures: { default: '{}' },
    citationNumber: { default: '' },
  },
  parseDOM: [
    {
      tag: 'p.ref',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          class: hook?.dom?.getAttribute('class'),
          refId: hook?.dom?.getAttribute('id'),
          valid: hook?.dom?.getAttribute('data-valid') === 'true',
          needsValidation: hook?.dom?.getAttribute('data-needs-validation')
            ? hook?.dom?.getAttribute('data-needs-validation') === 'true'
            : true,
          needsReview: hook?.dom?.getAttribute('data-needs-review') === 'true',
          structure: JSON.parse(
            hook?.dom?.getAttribute('data-structure') || '{}',
          ),
          possibleStructures: JSON.parse(
            hook?.dom?.getAttribute('data-possible-structures') || '{}',
          ),
          originalText: hook?.dom?.getAttribute('data-original-text') || '',
          citationNumber: hook?.dom?.getAttribute('data-citation-number') || '',
        })

        if (typeof next !== 'undefined') next()
      },
    },
  ],
  toDOM(hook, next) {
    const uid = uuid()

    const attrs = {
      class: hook?.node?.attrs?.class,
      'data-valid': hook?.node?.attrs?.valid,
      'data-needs-validation': hook?.node?.attrs?.needsValidation,
      'data-needs-review': hook?.node?.attrs?.needsReview,
      'data-original-text': hook?.node?.attrs?.originalText,
      'data-citation-number': hook?.node?.attrs?.citationNumber,
      id: hook?.node?.attrs?.refId,
    }

    if (hook?.node?.attrs?.structure) {
      attrs['data-structure'] = JSON.stringify(hook?.node?.attrs?.structure)
    }

    if (hook?.node?.attrs?.possibleStructures) {
      attrs['data-possible-structures'] = JSON.stringify(
        hook?.node?.attrs?.possibleStructures,
      )
    }

    if (!hook?.node?.attrs?.refId) {
      ;(hook.node.attrs as Record<string, unknown>).refId = uid
      attrs.id = uid
    }

    hook.value = ['p', attrs, 0]
    next()
  },
}

const citationPlugin = (key: string, config: unknown): Plugin =>
  new Plugin({
    key: new PluginKey(key),
    state: {
      init(): DecorationSet {
        return DecorationSet.empty
      },
      apply(tr, set): DecorationSet {
        set = set.map(tr.mapping, tr.doc)
        const action = tr.getMeta(this)

        if (action && action.add) {
          const widget = document.createElement('placeholder-citation')

          const deco = Decoration.widget(action.add.pos, widget, {
            id: action.add.id,
          })
          set = set.add(tr.doc, [deco])
        } else if (action && action.remove) {
          set = set.remove(
            set.find(null, null, spec => spec.id === action.remove.id),
          )
        }

        return set
      },
    },
    props: {
      config,
      decorations: (): undefined => undefined,
    } as Plugin['props'],
  })

// these are from here: https://github.com/atlassian/prosemirror-utils/tree/master/src

type Dispatch = (tr: Transaction) => void

type ParentNode = { pos: number; start: number; depth: number; node: Node }

// Checks if the type a given `node` equals to a given `nodeType`.
/* below are from prosemirror-schema-list: */

const equalNodeType = (nodeType: NodeType | NodeType[], node: Node): boolean =>
  (Array.isArray(nodeType) && nodeType.indexOf(node.type) > -1) ||
  node.type === nodeType

// Iterates over parent nodes starting from the given `$pos`, returning the closest node and its start position `predicate` returns truthy for. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const predicate = node => node.type === schema.nodes.blockquote;
// const parent = findParentNodeClosestToPos(state.doc.resolve(5), predicate);
// ```
const findParentNodeClosestToPos = (
  $pos: ResolvedPos,
  predicate: (node: Node) => boolean,
): ParentNode | undefined => {
  for (let i = $pos.depth; i > 0; i -= 1) {
    const node = $pos.node(i)

    if (predicate(node)) {
      return {
        pos: i > 0 ? $pos.before(i) : 0,
        start: $pos.start(i),
        depth: i,
        node,
      }
    }
  }

  return undefined
}

// Iterates over parent nodes starting from the given `$pos`, returning closest node of a given `nodeType`. `start` points to the start position of the node, `pos` points directly before the node.
//
// ```javascript
// const parent = findParentNodeOfTypeClosestToPos(state.doc.resolve(10), schema.nodes.paragraph);
// ```
const findParentNodeOfTypeClosestToPos = (
  $pos: ResolvedPos,
  nodeType: NodeType | NodeType[],
): ParentNode | undefined =>
  findParentNodeClosestToPos($pos, node => equalNodeType(nodeType, node))

const liftToOuterList = (
  state: EditorState,
  dispatch: Dispatch,
  itemType: NodeType,
  initialRange: NodeRange,
): boolean => {
  const { tr } = state
  let range = initialRange
  const { end } = range
  const endOfList = range.$to.end(range.depth)

  if (end < endOfList) {
    // There are siblings after the lifted items, which must become
    // children of the last item
    tr.step(
      new ReplaceAroundStep(
        end - 1,
        endOfList,
        end,
        endOfList,
        new Slice(
          Fragment.from(itemType.create(null, range.parent.copy())),
          1,
          0,
        ),
        1,
        true,
      ),
    )

    range = new NodeRange(
      tr.doc.resolve(range.$from.pos),
      tr.doc.resolve(endOfList),
      range.depth,
    )
  }

  const target = liftTarget(range)
  if (target == null) return false
  tr.lift(range, target)
  const after = tr.mapping.map(end, -1) - 1
  if (canJoin(tr.doc, after)) tr.join(after)
  dispatch(tr.scrollIntoView())
  return true
}

const liftOutOfList = (
  state: EditorState,
  dispatch: Dispatch,
  range: NodeRange,
  newType: NodeType,
  newClass: string,
): boolean => {
  const { tr } = state
  const list = range.parent

  // Merge the list items into a single big item
  for (
    let pos = range.end, i = range.endIndex - 1, e = range.startIndex;
    i > e;
    i -= 1
  ) {
    pos -= list.child(i).nodeSize
    tr.delete(pos - 1, pos + 1)
  }

  const $start = tr.doc.resolve(range.start)
  const item = $start.nodeAfter
  if (tr.mapping.map(range.end) !== range.start + $start.nodeAfter.nodeSize)
    return false
  const atStart = range.startIndex === 0
  const atEnd = range.endIndex === list.childCount
  const p = $start.node(-1) // p is parent
  const indexBefore = $start.index(-1)
  if (
    !p.canReplace(
      indexBefore + (atStart ? 0 : 1),
      indexBefore + 1,
      item.content.append(atEnd ? Fragment.empty : Fragment.from(list)),
    )
  )
    return false
  const start = $start.pos
  const end = start + item.nodeSize
  // Strip off the surrounding list. At the sides where we're not at
  // the end of the list, the existing list is closed. At sides where
  // this is the end, it is overwritten to its end.
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice(
        (atStart
          ? Fragment.empty
          : Fragment.from(list.copy(Fragment.empty))
        ).append(
          atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty)),
        ),
        atStart ? 0 : 1,
        atEnd ? 0 : 1,
      ),
      atStart ? 0 : 1,
    ),
  )

  const { from, to } = state.selection
  let citationNumber = ''
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name === 'list_item' && node.attrs.listnumber) {
      citationNumber = node.attrs.listnumber
    }

    if (!node.isTextblock || node.hasMarkup(newType, { class: newClass }))
      return
    let applicable = false

    if (node.type === newType) {
      applicable = true
    } else {
      // const $pos = state.doc.resolve(pos)
      // const index = $pos.index()
      applicable = node.type.name === 'paragraph'
      //  ||
      // $pos.parent.canReplaceWith(index, index + 1, newType)
    }

    if (applicable) {
      const newStart = pos
      const newEnd = pos + 1

      tr.setBlockType(newStart, newEnd, newType, {
        ...node.attrs,
        citationNumber,
        class: newClass,
      })

      // should we then stop?
    }
  })
  if (!tr.steps.length) return false

  dispatch(tr.scrollIntoView())
  return true
}

const liftListItemToType =
  (itemType: NodeType, newType: NodeType, newClass: string): Command =>
  (state, dispatch) => {
    const { $from, $to } = state.selection

    const range = $from.blockRange(
      $to,
      node => node.childCount > 0 && node.firstChild.type === itemType,
    )

    if (!range) return false
    if (!dispatch) return true

    if ($from.node(range.depth - 1).type === itemType) {
      // Inside a parent list
      return liftToOuterList(state, dispatch, itemType, range)
    }

    return liftOutOfList(state, dispatch, range, newType, newClass)
  }

export const setReference: Command = (state, dispatch) => {
  const isInAList = findParentNodeOfTypeClosestToPos(
    state.selection.$from,
    state.schema.nodes.list_item,
  )

  if (!isInAList) {
    return setBlockType(state.schema.nodes.reference, {
      class: 'ref',
    })(state, dispatch)
  }

  let done = false

  state.doc.nodesBetween(
    state.selection.$from.pos,
    state.selection.$to.pos,
    node => {
      if (node.type.name === 'list_item' && !done) {
        liftListItemToType(
          state.schema.nodes.list_item,
          state.schema.nodes.reference,
          'ref',
        )(state, dispatch)
        done = true
      }
    },
  )

  return true
}

export const updateReference =
  (pos: number, attrs: Record<string, unknown>, content?: Fragment): Command =>
  (state, dispatch) => {
    const node = state.doc.nodeAt(pos)
    if (!node || node.type.name !== 'reference') return false

    if (dispatch) {
      dispatch(
        state.tr.replaceWith(
          pos,
          pos + node.nodeSize,
          node.type.create(
            { ...node.attrs, ...attrs },
            content ?? node.content,
          ),
        ),
      )
    }

    return true
  }

export const referenceHtml = (state: EditorState, node: Node): string => {
  const container = document.createElement('article')
  container.appendChild(
    DOMSerializer.fromSchema(state.schema).serializeFragment(node.content),
  )
  return container.innerHTML
}

export const referenceContentFrom = (
  state: EditorState,
  html: string,
): Fragment => {
  const body = new window.DOMParser().parseFromString(
    `<body>${html}</body>`,
    'text/html',
  ).body

  return (
    DOMParser.fromSchema(state.schema).parse(body).firstChild?.content ??
    Fragment.empty
  )
}

export const canSetReference = (state: EditorState): boolean =>
  setBlockType(state.schema.nodes.reference)(state)

export const isReferenceActive = (state: EditorState): boolean => {
  const { from, to } = state.selection
  let active = false

  state.doc.nodesBetween(from, to, node => {
    if (node.type.name === 'reference') active = true
  })

  return active
}

const citation = (config?: unknown): WaxFeature => ({
  name: 'citation',
  waxNodes: { reference: referenceNode },
  plugins: () => ({ citationPlugin: citationPlugin('citationPlugin', config) }),
})

export default citation

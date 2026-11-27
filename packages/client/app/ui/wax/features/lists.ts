import { joinUp as pmJoinUp, lift as pmLift } from 'prosemirror-commands'
import {
  liftListItem,
  sinkListItem,
  splitListItem,
  wrapInList,
} from 'prosemirror-schema-list'
import type { Command, EditorState } from 'prosemirror-state'

import { blockActive, parseTracks } from './helpers'
import type { WaxFeature, WaxNodeSpec } from '../editor'

const trackAttrs = {
  id: { default: '' },
  track: { default: [] },
  group: { default: '' },
  viewid: { default: '' },
}

const parseTrack = (dom: HTMLElement): Record<string, unknown> => ({
  id: dom.dataset.id,
  track: parseTracks(dom.dataset.track),
  group: dom.dataset.group,
  viewid: dom.dataset.viewid,
})

const trackDOMAttrs = (
  attrs: Record<string, unknown>,
): Record<string, unknown> => {
  const { track } = attrs as { track?: unknown[] }
  if (!track || !track.length) return {}

  return {
    'data-id': attrs.id,
    'data-track': JSON.stringify(track),
    'data-group': attrs.group,
    'data-viewid': attrs.viewid,
  }
}

const listItemNode: WaxNodeSpec = {
  content: 'paragraph block*',
  attrs: {
    ...trackAttrs,
    listnumber: { default: '' },
  },
  parseDOM: [
    {
      tag: 'li',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          ...parseTrack(hook.dom),
          listnumber: hook.dom.dataset.listnumber,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = [
      'li',
      {
        ...trackDOMAttrs(hook.node.attrs),
        'data-listnumber': hook.node.attrs.listnumber,
      },
      0,
    ]
    next()
  },
  defining: true,
}

const bulletListNode: WaxNodeSpec = {
  group: 'block',
  content: 'list_item+',
  attrs: trackAttrs,
  parseDOM: [
    {
      tag: 'ul',
      getAttrs(hook, next): void {
        Object.assign(hook, parseTrack(hook.dom))
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = ['ul', trackDOMAttrs(hook.node.attrs), 0]
    next()
  },
}

const orderedListNode: WaxNodeSpec = {
  group: 'block',
  content: 'list_item+',
  attrs: {
    order: { default: 1 },
    track: { default: [] },
    id: { default: '' },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          ...parseTrack(hook.dom),
          order: hook.dom.hasAttribute('start')
            ? +hook.dom.getAttribute('start')
            : 1,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    const { order } = hook.node.attrs

    hook.value = [
      'ol',
      {
        ...(order !== 1 ? { start: order } : {}),
        ...trackDOMAttrs(hook.node.attrs),
      },
      0,
    ]
    next()
  },
}

export const wrapInBulletList: Command = (state, dispatch) =>
  wrapInList(state.schema.nodes.bulletlist)(state, dispatch)

export const wrapInOrderedList: Command = (state, dispatch) =>
  wrapInList(state.schema.nodes.orderedlist)(state, dispatch)

export const canWrapInList = (state: EditorState): boolean =>
  wrapInList(state.schema.nodes.bulletlist)(state)

export const isBulletListActive = (state: EditorState): boolean =>
  blockActive(state.schema.nodes.bulletlist)(state)

export const isOrderedListActive = (state: EditorState): boolean =>
  blockActive(state.schema.nodes.orderedlist)(state)

export const isInListItem = (state: EditorState): boolean => {
  const { from, to } = state.selection
  let inside = false

  state.doc.nodesBetween(from, to, node => {
    if (node.type.name === 'list_item') inside = true
  })

  return inside
}

export const liftItem: Command = (state, dispatch) =>
  liftListItem(state.schema.nodes.list_item)(state, dispatch)

export const sinkItem: Command = (state, dispatch) =>
  sinkListItem(state.schema.nodes.list_item)(state, dispatch)

export const lift: Command = pmLift

export const joinUp: Command = pmJoinUp

const lists: WaxFeature = {
  name: 'lists',
  waxNodes: {
    list_item: listItemNode,
    bulletlist: bulletListNode,
    orderedlist: orderedListNode,
  },
  shortcuts: {
    Enter: (state, dispatch) =>
      splitListItem(state.schema.nodes.list_item)(state, dispatch),
    'Shift-Ctrl-8': wrapInBulletList,
    'Shift-Ctrl-9': wrapInOrderedList,
    'Mod-[': liftItem,
    'Mod-]': sinkItem,
  },
}

export default lists

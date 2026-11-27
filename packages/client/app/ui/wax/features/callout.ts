import { Fragment } from 'prosemirror-model'
import {
  NodeSelection,
  Plugin,
  PluginKey,
  type Command,
  type EditorState,
} from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'
import { uuid } from '@coko/client'

import type { WaxFeature, WaxNodeSpec } from '../editor'

const calloutNode: WaxNodeSpec = {
  group: 'inline',
  content: 'text*',
  inline: true,
  atom: true,
  attrs: {
    id: { default: '' },
    class: { default: 'callout' },
    citationItems: { default: [] },
    citationCalloutText: { default: '[?]' },
  },
  parseDOM: [
    {
      tag: 'span.callout',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          id: hook?.dom?.getAttribute('id'),
          class: hook?.dom?.getAttribute('class'),
          citationItems: JSON.parse(
            hook?.dom?.getAttribute('data-citationitems'),
          ),
          citationCalloutText: hook?.dom?.getAttribute(
            'data-citationcallouttext',
          ),
        })

        if (typeof next !== 'undefined') next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {
      class: hook?.node?.attrs?.class,
      id: hook?.node?.attrs?.id,
      'data-citationitems': JSON.stringify(hook?.node?.attrs?.citationItems),
      'data-citationcallouttext': hook?.node?.attrs?.citationCalloutText,
    }

    hook.value = ['span', attrs, 0]
    next()
  },
}

const calloutPlugin = (key: string, config: unknown): Plugin =>
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
          const widget = document.createElement('placeholder-callout')

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
      decorations(state): DecorationSet {
        return this.getState(state)
      },
    } as Plugin['props'],
  })

export const findReferenceNodeOptions = (
  state: EditorState,
): Record<string, unknown>[] => {
  const referenceOptions = []

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (node.type.name === 'reference' && node.attrs.valid === true) {
      const { refId, structure, originalText } = node.attrs
      if (
        structure &&
        structure.author &&
        (structure.author[0].given || structure.author[0].family) &&
        structure.title &&
        structure.issued &&
        structure.formattedCitation
      ) {
        referenceOptions.push({
          ...structure,
          id: refId,
          originalText,
        })
      }
    }
  })

  return referenceOptions
}

export const findReferenceNodes = (
  state: EditorState,
): { items: Record<string, unknown>[] } => {
  const references = {
    items: [],
  }

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (node.type.name === 'reference' && node.attrs.valid === true) {
      const item = {
        id: node.attrs.refId,
        ...node.attrs.structure,
      }

      references.items.push(item)
    }
  })

  return references
}

export const findCalloutNodes = (
  state: EditorState,
): { citationID: string; citationItems: unknown[] }[] => {
  const callouts = []

  state.doc.nodesBetween(0, state.doc.content.size, node => {
    if (
      node.type.name === 'callout' &&
      node.attrs.citationItems &&
      node.attrs.citationItems.length > 0
    ) {
      callouts.push({
        citationID: node.attrs.id,
        citationItems: node.attrs.citationItems,
      })
    }
  })

  return callouts
}

export type CalloutItem = { id: string }

export const updateCallout =
  (pos: number, items: CalloutItem[], text?: string): Command =>
  (state, dispatch) => {
    const node = state.doc.nodeAt(pos)
    if (!node || node.type.name !== 'callout') return false

    if (dispatch) {
      const attrs = {
        ...node.attrs,
        citationItems: items,
        ...(text !== undefined ? { citationCalloutText: text } : {}),
      }

      const tr =
        text !== undefined
          ? state.tr.replaceWith(
              pos,
              pos + node.nodeSize,
              node.type.create(attrs, state.schema.text(text)),
            )
          : state.tr.setNodeMarkup(pos, node.type, attrs, node.marks)

      dispatch(tr.scrollIntoView())
    }

    return true
  }

export const insertCallout: Command = (state, dispatch) => {
  const { empty, $from, $to } = state.selection
  let content = Fragment.empty
  const { tr } = state

  if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
    content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)

  const callout = state.schema.nodes.callout.create({ id: uuid() }, content)

  tr.replaceSelectionWith(callout)

  const resolvedPos = tr.doc.resolve(
    tr.selection.anchor - tr.selection.$anchor.nodeBefore.nodeSize,
  )

  tr.setSelection(new NodeSelection(resolvedPos))

  if (dispatch) dispatch(tr)
  return true
}

const callout = (config?: unknown): WaxFeature => ({
  name: 'callout',
  waxNodes: { callout: calloutNode },
  plugins: () => ({ calloutPlugin: calloutPlugin('calloutPlugin', config) }),
})

export default callout

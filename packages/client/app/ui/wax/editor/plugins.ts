import { dropCursor } from 'prosemirror-dropcursor'
import { gapCursor } from 'prosemirror-gapcursor'
import { history } from 'prosemirror-history'
import { inputRules, smartQuotes } from 'prosemirror-inputrules'
import type { Schema } from 'prosemirror-model'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

import type { WaxFeature } from './types'
import createKeymap from './keymap'

const placeholderKey = new PluginKey('placeHolderText')

const placeholder = (content: string): Plugin =>
  new Plugin({
    key: placeholderKey,
    props: {
      decorations: (state): DecorationSet => {
        const decorations: Decoration[] = []

        state.doc.descendants((node, pos) => {
          if (
            node.type.isBlock &&
            node.childCount === 0 &&
            state.doc.content.childCount === 1
          ) {
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: 'empty-node',
                'data-content': content,
              }),
            )
          }
        })

        return DecorationSet.create(state.doc, decorations)
      },
    },
  })

type PluginOptions = {
  features: WaxFeature[]
  schema: Schema
  placeholder: string
}

const createPlugins = ({
  features,
  schema,
  placeholder: placeholderText,
}: PluginOptions): Plugin[] => [
  history(),
  dropCursor(),
  gapCursor(),
  placeholder(placeholderText),
  ...features.flatMap(feature =>
    feature.plugins ? Object.values(feature.plugins()) : [],
  ),
  createKeymap(features.flatMap(feature => feature.shortcuts ?? [])),
  inputRules({
    rules: [
      ...smartQuotes,
      ...features.flatMap(feature => feature.rules?.(schema) ?? []),
    ],
  }),
]

export default createPlugins

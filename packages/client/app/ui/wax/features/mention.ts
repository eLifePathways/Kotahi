import autocomplete, { type Options } from 'prosemirror-autocomplete'
import type { MarkSpec } from 'prosemirror-model'
import type { Plugin } from 'prosemirror-state'

import { keyedPlugins } from './helpers'
import type { WaxFeature } from '../editor'

type MentionOptions = {
  reducer: Options['reducer']
}

const mentionMark: MarkSpec = {
  attrs: {
    class: { default: 'mention-tag' },
    id: { default: '' },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'span.mention-tag',
      getAttrs: (dom: HTMLElement) => ({
        class: dom.getAttribute('class'),
        id: dom.getAttribute('id'),
      }),
    },
  ],
  toDOM: node => ['span', node.attrs, 0],
}

const mentionPlugins = ({ reducer }: MentionOptions): Plugin[] =>
  autocomplete({
    reducer,
    triggers: [
      {
        name: 'mention',
        trigger: /(@)$/,
        decorationAttrs: { class: 'mention-tag' },
      },
    ],
  })

const mention = (options: MentionOptions): WaxFeature => ({
  name: 'mention',
  marks: { mention_tag: mentionMark },
  plugins: () => keyedPlugins('autocomplete', mentionPlugins(options)),
})

export default mention

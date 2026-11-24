import autocomplete, { type Options } from 'prosemirror-autocomplete'
import type { MarkSpec } from 'prosemirror-model'

import { keyedPlugins } from './helpers'
import type { WaxFeature } from './types'

type AutocompleteOptions = {
  markName: string
  className: string
  reducer: Options['reducer']
  triggers: Options['triggers']
}

const autocompleteMark = (className: string): MarkSpec => ({
  attrs: {
    class: { default: className },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: `span.${className}`,
      getAttrs: (dom: HTMLElement) => ({
        class: dom.getAttribute('class'),
      }),
    },
  ],
  toDOM: node => ['span', node.attrs, 0],
})

const autocompleteFeature = ({
  markName,
  className,
  reducer,
  triggers,
}: AutocompleteOptions): WaxFeature => ({
  name: 'autocomplete',
  marks: { [markName]: autocompleteMark(className) },
  plugins: () =>
    keyedPlugins('autocomplete', autocomplete({ reducer, triggers })),
})

export default autocompleteFeature

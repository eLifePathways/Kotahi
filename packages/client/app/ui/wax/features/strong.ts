import type { MarkSpec } from 'prosemirror-model'

import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature } from '../editor'

const strongMark: MarkSpec = {
  parseDOM: [
    { tag: 'strong' },
    // This works around a Google Docs misbehavior where
    // pasted content will be inexplicably wrapped in `<b>`
    // tags with a font-weight normal.
    {
      tag: 'b',
      getAttrs: (node: HTMLElement) =>
        node.style.fontWeight !== 'normal' && null,
    },
    {
      style: 'font-weight',
      getAttrs: (value: string) =>
        /^(bold(er)?|[5-9]\d{2,})$/.test(value) && null,
    },
  ],
  toDOM() {
    return ['strong', 0]
  },
}

export const toggleStrong = toggleMarkByName('strong')

export const isStrongActive = isMarkActive('strong')

export const canToggleStrong = hasSelection

const strong: WaxFeature = {
  name: 'strong',
  marks: { strong: strongMark },
  flushSchemaOnRegister: true,
  shortcuts: { 'Mod-b': toggleStrong },
}

export default strong

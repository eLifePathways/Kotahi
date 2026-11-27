import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from '../editor'

const strikethroughMark: WaxMarkSpec = {
  attrs: {
    class: { default: 'strikethrough' },
  },
  inclusive: false,
  parseDOM: [
    {
      tag: 'span.strikethrough',
      getAttrs(hook, next): void {
        Object.assign(hook, {
          class: hook.dom.getAttribute('class'),
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    hook.value = ['span', hook.node.attrs, 0]
    next()
  },
}

export const toggleStrikethrough = toggleMarkByName('strikethrough')

export const isStrikethroughActive = isMarkActive('strikethrough')

export const canToggleStrikethrough = hasSelection

const strikethrough: WaxFeature = {
  name: 'strikethrough',
  waxMarks: { strikethrough: strikethroughMark },
}

export default strikethrough

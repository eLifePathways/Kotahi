import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from '../editor'

const smallcapsMark: WaxMarkSpec = {
  attrs: {
    class: { default: 'small-caps' },
  },
  // inclusive: false,
  parseDOM: [
    {
      tag: 'span.small-caps',
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

export const toggleSmallCaps = toggleMarkByName('smallcaps')

export const isSmallCapsActive = isMarkActive('smallcaps')

export const canToggleSmallCaps = hasSelection

const smallCaps: WaxFeature = {
  name: 'smallCaps',
  waxMarks: { smallcaps: smallcapsMark },
}

export default smallCaps

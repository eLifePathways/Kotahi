import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from './types'

const subscriptMark: WaxMarkSpec = {
  excludes: 'superscript',
  parseDOM: [{ tag: 'sub' }, { style: 'vertical-align=sub' }],
  toDOM(hook, next) {
    hook.value = ['sub']
    next()
  },
}

export const toggleSubscript = toggleMarkByName('subscript')

export const isSubscriptActive = isMarkActive('subscript')

export const canToggleSubscript = hasSelection

const subscript: WaxFeature = {
  name: 'subscript',
  waxMarks: { subscript: subscriptMark },
}

export default subscript

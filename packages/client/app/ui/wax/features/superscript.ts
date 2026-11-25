import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from './types'

const superscriptMark: WaxMarkSpec = {
  excludes: 'subscript',
  parseDOM: [{ tag: 'sup' }, { style: 'vertical-align=super' }],
  toDOM: (hook, next) => {
    hook.value = ['sup']
    next()
  },
}

export const toggleSuperscript = toggleMarkByName('superscript')

export const isSuperscriptActive = isMarkActive('superscript')

export const canToggleSuperscript = hasSelection

const superscript: WaxFeature = {
  name: 'superscript',
  waxMarks: { superscript: superscriptMark },
}

export default superscript

import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from './types'

const underlineMark: WaxMarkSpec = {
  parseDOM: [{ tag: 'u' }],
  toDOM: (hook, next) => {
    hook.value = ['u']
    next()
  },
}

export const toggleUnderline = toggleMarkByName('underline')

export const isUnderlineActive = isMarkActive('underline')

export const canToggleUnderline = hasSelection

const underline: WaxFeature = {
  name: 'underline',
  waxMarks: { underline: underlineMark },
  flushSchemaOnRegister: true,
  shortcuts: { 'Mod-u': toggleUnderline },
}

export default underline

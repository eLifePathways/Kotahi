import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from '../editor'

const codeMark: WaxMarkSpec = {
  parseDOM: { tag: 'code' },
  toDOM(hook, next) {
    hook.value = ['code', 0]
    next()
  },
}

export const toggleCode = toggleMarkByName('code')

export const isCodeActive = isMarkActive('code')

export const canToggleCode = hasSelection

const code: WaxFeature = {
  name: 'code',
  waxMarks: { code: codeMark },
  flushSchemaOnRegister: true,
  shortcuts: { 'Mod-`': toggleCode },
}

export default code

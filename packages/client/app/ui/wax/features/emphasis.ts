import { hasSelection, isMarkActive, toggleMarkByName } from './helpers'
import type { WaxFeature, WaxMarkSpec } from '../editor'

const emphasisMark: WaxMarkSpec = {
  parseDOM: [{ tag: 'i' }, { tag: 'em' }, { style: 'font-style=italic' }],
  toDOM(hook, next) {
    hook.value = ['em', 0]
    next()
  },
}

export const toggleEmphasis = toggleMarkByName('em')

export const isEmphasisActive = isMarkActive('em')

export const canToggleEmphasis = hasSelection

const emphasis: WaxFeature = {
  name: 'emphasis',
  waxMarks: { em: emphasisMark },
  flushSchemaOnRegister: true,
  shortcuts: { 'Mod-i': toggleEmphasis },
}

export default emphasis

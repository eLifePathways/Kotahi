import { redo as pmRedo, undo as pmUndo } from 'prosemirror-history'
import type { Command, EditorState } from 'prosemirror-state'

import type { WaxFeature } from './types'

export const undo: Command = (state, dispatch) =>
  pmUndo(
    state,
    dispatch && ((tr): void => dispatch(tr.setMeta('inputType', 'Undo'))),
  )

export const redo: Command = (state, dispatch) =>
  pmRedo(
    state,
    dispatch && ((tr): void => dispatch(tr.setMeta('inputType', 'Redo'))),
  )

export const canUndo = (state: EditorState): boolean => pmUndo(state)

export const canRedo = (state: EditorState): boolean => pmRedo(state)

const history: WaxFeature = {
  name: 'history',
}

export default history

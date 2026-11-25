import { TextSelection } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

const selectRange = (
  view: EditorView | undefined,
  from: number,
  to = from,
): void => {
  if (!view) return
  view.dispatch(
    view.state.tr
      .setSelection(TextSelection.create(view.state.doc, from, to))
      .scrollIntoView(),
  )
  view.focus()
}

export default selectRange

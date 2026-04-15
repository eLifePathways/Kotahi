import { toggleMark } from 'prosemirror-commands'
import { Commands, DocumentHelpers } from 'wax-prosemirror-core'

// Sources:
// This function:
// https://github.com/Coko-Foundation/wax-prosemirror/blob/master/wax-prosemirror-core/src/utilities/commands/Commands.js#L30
// (discussed and based on what's here: hhttps://discuss.prosemirror.net/t/expanding-the-selection-to-the-active-mark/478)
// tells you if a given mark is active. If that is the case, we can use this function:
// https://github.com/Coko-Foundation/wax-prosemirror/blob/master/wax-prosemirror-core/src/utilities/document/DocumentHelpers.js#L163
// to expand the current text selection to the outside mark boundary.

const removeOrToggleMark = (state, dispatch, markName) => {
  // First, we check to see if the mark with markName is active at the current selection.
  const isActive = Commands.markActive(state.config.schema.marks[markName])(
    state,
  )

  if (isActive) {
    // This finds the inmost mark of the type that we're looking for
    const foundPosition = DocumentHelpers.findMarkPosition(
      state,
      state.selection.$anchor.pos,
      state.config.schema.marks[markName].name,
    )

    // This dispatch removes the mark that we've found

    dispatch(
      state.tr.removeMark(
        foundPosition.from,
        foundPosition.to,
        state.config.schema.marks[markName],
      ),
    )
  } else {
    // If the mark is not active, we go back to the default method. This is actually just adding a mark, we could theoretically use addMark
    toggleMark(state.config.schema.marks[markName])(state, dispatch)
  }
}

export default removeOrToggleMark

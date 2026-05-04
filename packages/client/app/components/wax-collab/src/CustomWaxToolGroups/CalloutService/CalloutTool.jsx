import { decorate, injectable } from 'inversify'
import { Fragment } from 'prosemirror-model'
import { v4 as uuidv4 } from 'uuid'
import { LeftSideButton, Tools } from 'wax-prosemirror-core'
import { NodeSelection } from 'prosemirror-state'
import { isEmpty } from 'lodash'

class CalloutTool extends Tools {
  title = 'Reference callout'
  label = 'Reference callout'
  name = 'Callout'

  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      const { empty, $from, $to } = state.selection
      let content = Fragment.empty
      const { tr } = state

      if (!empty && $from.sameParent($to) && $from.parent.inlineContent)
        content = $from.parent.content.cut($from.parentOffset, $to.parentOffset)

      const callout = state.config.schema.nodes.callout.create(
        { id: uuidv4() },
        content,
      )

      tr.replaceSelectionWith(callout)

      const resolvedPos = tr.doc.resolve(
        tr.selection.anchor - tr.selection.$anchor.nodeBefore.nodeSize,
      )

      tr.setSelection(new NodeSelection(resolvedPos))

      dispatch(tr)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  select = (state, activeViewId) => {
    if (activeViewId !== 'main') return false
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get enable() {
    return () => {
      return false
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="Callout" view={view} />
    ) : null
  }
}

decorate(injectable(), CalloutTool)

export default CalloutTool

import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import i18next from 'i18next'
import {
  LeftSideButton,
  Commands,
  Tools,
} from '../../../../../ui/wax/wax-prosemirror-core'
import { findParentNodeOfTypeClosestToPos, liftListItemToType } from './helpers'

class ReferenceTool extends Tools {
  title = i18next.t('waxEditor.Change to reference')
  label = i18next.t('waxEditor.Reference')
  name = 'Reference'

  get run() {
    // This fires when the tool is shown

    return (state, dispatch) => {
      // this fires when the tool is clicked.
      // need to check if we're in a list, if so split

      const isInAList = findParentNodeOfTypeClosestToPos(
        state.selection.$from,
        state.schema.nodes.list_item,
      )

      if (isInAList) {
        let done = false
        state.doc.nodesBetween(
          state.selection.$from.pos,
          state.selection.$to.pos,
          node => {
            if (node.type.name === 'list_item' && !done) {
              // console.log('in list item, running liftListItemToType')
              liftListItemToType(
                state.schema.nodes.list_item,
                state.config.schema.nodes.reference,
                'ref',
              )(state, dispatch)
              done = true
            }
          },
        )
      } else {
        Commands.setBlockType(state.config.schema.nodes.reference, {
          class: 'ref',
        })(state, dispatch)
      }
    }
  }

  get active() {
    return (state, activeViewId) => {
      let isActive = false

      const currentViewPossible =
        activeViewId === 'main' || activeViewId.indexOf('note-') === 0

      if (!currentViewPossible) return false
      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'reference') {
          isActive = true
        }
      })
      return isActive
    }
  }

  select = (state, activeViewId) => {
    if (activeViewId !== 'main' && activeViewId.indexOf('note-') !== 0) {
      return false
    }

    return true
  }

  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.reference)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="Reference" view={view} />
    ) : null
  }
}

decorate(injectable(), ReferenceTool)

export default ReferenceTool

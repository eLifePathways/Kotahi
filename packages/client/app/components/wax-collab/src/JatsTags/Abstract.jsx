import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { wrapIn } from 'prosemirror-commands'
import i18next from 'i18next'
import {
  LeftSideButton,
  Commands,
  Tools,
} from '../../../../ui/wax/wax-prosemirror-core'

class Abstract extends Tools {
  title = i18next.t('waxEditor.Change to abstract')
  label = i18next.t('waxEditor.Abstract')
  name = 'Abstract'

  // get run() {
  //   return (state, dispatch) => {
  //     Commands.setBlockType(state.config.schema.nodes.abstractSection)(
  //       state,
  //       dispatch,
  //     )
  //   }
  // }
  get run() {
    return (state, dispatch) => {
      wrapIn(state.config.schema.nodes.abstractSection)(state, dispatch)
    }
  }

  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'abstractSection') {
          isActive = true
        }
      })
      return isActive
    }
  }

  select = (state, activeViewId) => {
    if (activeViewId !== 'main') return false
    return true
  }

  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.abstractSection)(
        state,
      )
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="Abstract" view={view} />
    ) : null
  }
}

decorate(injectable(), Abstract)

export default Abstract

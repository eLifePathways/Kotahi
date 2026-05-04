import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { LeftSideButton, Commands, Tools } from 'wax-prosemirror-core'
import { wrapIn } from 'prosemirror-commands'
import i18next from 'i18next'

class RefList extends Tools {
  title = i18next.t('waxEditor.Change to reference list')
  label = i18next.t('waxEditor.Reference list')
  name = 'RefList'

  // get run() {
  //   return (state, dispatch) => {
  //     Commands.setBlockType(state.config.schema.nodes.appendix)(
  //       state,
  //       dispatch,
  //     )
  //   }
  // }
  // eslint-disable-next-line class-methods-use-this
  get run() {
    return (state, dispatch) => {
      wrapIn(state.config.schema.nodes.refList)(state, dispatch)
    }
  }

  // eslint-disable-next-line class-methods-use-this
  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'refList') {
          isActive = true
        }
      })
      return isActive
    }
  }

  // eslint-disable-next-line class-methods-use-this
  select = (state, activeViewId) => {
    if (activeViewId !== 'main') return false
    return true
  }

  // eslint-disable-next-line class-methods-use-this
  get enable() {
    return state => {
      return Commands.setBlockType(state.config.schema.nodes.refList)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="RefList" view={view} />
    ) : null
  }
}

decorate(injectable(), RefList)

export default RefList

import { isEmpty } from 'lodash'
import i18next from 'i18next'
import { LeftSideButton, Commands, Tools } from '../../../wax-prosemirror-core'

class AwardId extends Tools {
  title = i18next.t('waxEditor.Change to award ID')
  label = i18next.t('waxEditor.Award ID')
  name = 'AwardId'
  color = 'colorAwardId'
  className = 'awardid'

  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.awardId)(state, dispatch)
    }
  }

  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'awardId') {
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
      return Commands.setBlockType(state.config.schema.nodes.awardId)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="AwardId" view={view} />
    ) : null
  }
}

export default AwardId

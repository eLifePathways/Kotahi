import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import i18next from 'i18next'
import {
  LeftSideButton,
  Commands,
  Tools,
} from '../../../../../ui/wax/wax-prosemirror-core'

class FundingSource extends Tools {
  title = i18next.t('waxEditor.Change to funding source')
  label = i18next.t('waxEditor.Funding source')
  name = 'FundingSource'
  color = 'colorFundingSource'
  className = 'fundingsource'

  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.fundingSource)(
        state,
        dispatch,
      )
    }
  }

  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'fundingSource') {
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
      return Commands.setBlockType(state.config.schema.nodes.fundingSource)(
        state,
      )
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="FundingSource" view={view} />
    ) : null
  }
}

decorate(injectable(), FundingSource)

export default FundingSource

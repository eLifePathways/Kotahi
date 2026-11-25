import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { LeftSideButton, Commands, Tools } from 'wax-prosemirror-core'
import i18next from 'i18next'

class FundingStatement extends Tools {
  title = i18next.t('waxEditor.Change to funding statement')
  label = i18next.t('waxEditor.Funding statement')
  name = 'FundingStatement'
  color = 'colorFundingStatement'
  className = 'fundingstatement'

  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.fundingStatement)(
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
        if (node.type.name === 'fundingStatement') {
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
      return Commands.setBlockType(state.config.schema.nodes.fundingStatement)(
        state,
      )
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="FundingStatement" view={view} />
    ) : null
  }
}

decorate(injectable(), FundingStatement)

export default FundingStatement

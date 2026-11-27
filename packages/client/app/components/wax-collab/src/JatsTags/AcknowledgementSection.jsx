import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { wrapIn } from 'prosemirror-commands'
import i18next from 'i18next'
import {
  LeftSideButton,
  Commands,
  Tools,
} from '../../../../ui/wax/wax-prosemirror-core'

class AcknowledgementsSection extends Tools {
  title = i18next.t('waxEditor.Change to acknowledgements')
  label = i18next.t('waxEditor.Acknowledgements')
  name = 'AcknowledgementsSection'

  get run() {
    return (state, dispatch) => {
      wrapIn(state.config.schema.nodes.acknowledgementsSection)(state, dispatch)
    }
  }

  get active() {
    return (state, activeViewId) => {
      let isActive = false
      if (activeViewId !== 'main') return false

      const { from, to } = state.selection
      state.doc.nodesBetween(from, to, node => {
        if (node.type.name === 'acknowledgementsSection') {
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
      return Commands.setBlockType(
        state.config.schema.nodes.acknowledgementsSection,
      )(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton
        item={this.toJSON()}
        key="AcknowledgementsSection"
        view={view}
      />
    ) : null
  }
}

decorate(injectable(), AcknowledgementsSection)

export default AcknowledgementsSection

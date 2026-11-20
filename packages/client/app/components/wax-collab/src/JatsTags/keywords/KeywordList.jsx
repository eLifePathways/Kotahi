import { decorate, injectable } from 'inversify'
import { isEmpty } from 'lodash'
import i18next from 'i18next'
import {
  LeftSideButton,
  Commands,
  Tools,
} from '../../../../../ui/wax/wax-prosemirror-core'

class KeywordList extends Tools {
  title = i18next.t('waxEditor.Change to keyword list')
  label = i18next.t('waxEditor.Keyword list')
  name = 'KeywordList'
  // color = 'colorKeyWordList'
  // className = 'keywordlist'

  get run() {
    return (state, dispatch) => {
      Commands.setBlockType(state.config.schema.nodes.keywordList)(
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
        if (node.type.name === 'keywordList') {
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
      return Commands.setBlockType(state.config.schema.nodes.keywordList)(state)
    }
  }

  renderTool(view) {
    if (isEmpty(view)) return null

    return this._isDisplayed ? (
      <LeftSideButton item={this.toJSON()} key="KeywordList" view={view} />
    ) : null
  }
}

decorate(injectable(), KeywordList)

export default KeywordList

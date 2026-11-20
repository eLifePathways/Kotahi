import { decorate, injectable } from 'inversify'
import { toggleMark } from 'prosemirror-commands'
import i18next from 'i18next'
import { Commands, Tools } from '../../../wax-prosemirror-core'

class Keyword extends Tools {
  title = i18next.t('waxEditor.Change to keyword')
  label = i18next.t('waxEditor.Keyword')
  // color = 'colorKeyword'
  // className = 'keyword'
  // icon = 'title'
  name = 'Keyword'

  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.keyword)(state, dispatch)
    }
  }

  select = state => {
    const {
      selection: { from },
    } = state

    if (from === null) return false
    return true
  }

  get active() {
    return state => {
      return Commands.markActive(state.config.schema.marks.keyword)(state)
    }
  }
}

decorate(injectable(), Keyword)

export default Keyword

import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class FirstPage extends Tools {
  title = 'Change to first page'
  label = 'First page'
  color = 'colorFirstPage'
  className = 'first-page'
  // icon = 'title'
  name = 'FirstPage'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'firstPage')
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
      return Commands.markActive(state.config.schema.marks.firstPage)(state)
    }
  }
}

decorate(injectable(), FirstPage)

export default FirstPage

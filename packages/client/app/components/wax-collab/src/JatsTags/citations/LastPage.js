import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class LastPage extends Tools {
  title = 'Change to last page'
  label = 'Last page'
  color = 'colorLastPage'
  className = 'last-page'
  // icon = 'title'
  name = 'LastPage'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'lastPage')
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
      return Commands.markActive(state.config.schema.marks.lastPage)(state)
    }
  }
}

decorate(injectable(), LastPage)

export default LastPage

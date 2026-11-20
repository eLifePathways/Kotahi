import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class Year extends Tools {
  title = 'Change to year'
  label = 'Year'
  color = 'colorYear'
  className = 'year'
  // icon = 'title'
  name = 'Year'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'year')
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
      return Commands.markActive(state.config.schema.marks.year)(state)
    }
  }
}

decorate(injectable(), Year)

export default Year

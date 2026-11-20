import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class Volume extends Tools {
  title = 'Change to volume'
  label = 'Volume'
  color = 'colorVolume'
  className = 'volume'
  // icon = 'title'
  name = 'Volume'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'volume')
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
      return Commands.markActive(state.config.schema.marks.volume)(state)
    }
  }
}

decorate(injectable(), Volume)

export default Volume

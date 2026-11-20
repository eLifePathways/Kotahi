import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class MixedCitationSpan extends Tools {
  title = 'Change to mixed citation'
  label = 'Mixed citation'
  color = 'colorCitation'
  // icon = 'title'
  name = 'MixedCitationSpan'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'mixedCitationSpan')
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
      return Commands.markActive(state.config.schema.marks.mixedCitationSpan)(
        state,
      )
    }
  }
}

decorate(injectable(), MixedCitationSpan)

export default MixedCitationSpan

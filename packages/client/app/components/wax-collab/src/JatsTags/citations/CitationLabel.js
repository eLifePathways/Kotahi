import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class CitationLabel extends Tools {
  title = 'Change to citation label'
  label = 'Citation label'
  color = 'colorCitationLabel'
  className = 'citation-label'
  // icon = 'title'
  name = 'CitationLabel'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'citationLabel')
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
      return Commands.markActive(state.config.schema.marks.citationLabel)(state)
    }
  }
}

decorate(injectable(), CitationLabel)

export default CitationLabel

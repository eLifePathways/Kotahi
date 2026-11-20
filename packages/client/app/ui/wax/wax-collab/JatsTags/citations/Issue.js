import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class Issue extends Tools {
  title = 'Change to issue'
  label = 'Issue'
  color = 'colorIssue'
  className = 'issue'
  // icon = 'title'
  name = 'Issue'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'issue')
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
      return Commands.markActive(state.config.schema.marks.issue)(state)
    }
  }
}

decorate(injectable(), Issue)

export default Issue

import { decorate, injectable } from 'inversify'
import { Commands, Tools } from '../../../../../ui/wax/wax-prosemirror-core'
import removeOrToggleMark from '../removeOrToggleMark'

class AuthorGroup extends Tools {
  title = 'Change to author group'
  label = 'Author group'
  color = 'colorAuthorGroup'
  className = 'author-group'
  // icon = 'title'
  name = 'AuthorGroup'

  get run() {
    return (state, dispatch) => {
      removeOrToggleMark(state, dispatch, 'authorGroup')
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
      return Commands.markActive(state.config.schema.marks.authorGroup)(state)
    }
  }
}

decorate(injectable(), AuthorGroup)

export default AuthorGroup

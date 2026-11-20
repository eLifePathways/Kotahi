import { toggleMark } from 'prosemirror-commands'
import i18next from 'i18next'
import { Commands, Tools } from '../../../wax-prosemirror-core'

class GlossaryTerm extends Tools {
  title = i18next.t('waxEditor.Change to glossary term')
  label = i18next.t('waxEditor.Glossary term')
  // color = 'colorGlossaryTerm'
  // className = 'glossaryTerm'
  // icon = 'title'
  name = 'GlossaryTerm'

  get run() {
    return (state, dispatch) => {
      toggleMark(state.config.schema.marks.glossaryTerm)(state, dispatch)
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
      return Commands.markActive(state.config.schema.marks.glossaryTerm)(state)
    }
  }
}

export default GlossaryTerm

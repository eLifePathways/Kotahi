// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class GlossaryGroup extends ToolGroup {
  static inject = ['GlossarySection', 'GlossaryTerm']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Glossary')} />)

  constructor(glossarySection, glossaryTerm) {
    super()
    this._tools = [glossarySection, glossaryTerm]
  }
}

export default GlossaryGroup

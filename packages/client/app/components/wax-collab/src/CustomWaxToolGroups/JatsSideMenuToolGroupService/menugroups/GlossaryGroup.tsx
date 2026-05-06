// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class GlossaryGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Glossary')} />)

  constructor(
    @inject('GlossarySection') glossarySection,
    @inject('GlossaryTerm') glossaryTerm,
  ) {
    super()
    this.tools = [glossarySection, glossaryTerm]
  }
}

decorate(injectable(), GlossaryGroup)

export default GlossaryGroup

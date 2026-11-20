// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import i18next from 'i18next'
import {
  ToolGroup,
  LeftMenuTitle,
} from '../../../../../../ui/wax/wax-prosemirror-core'

class GlossaryGroup extends ToolGroup {
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Glossary')} />)

  constructor(
    @inject('GlossarySection') glossarySection,
    @inject('GlossaryTerm') glossaryTerm,
  ) {
    super()
    this._tools = [glossarySection, glossaryTerm]
  }
}

decorate(injectable(), GlossaryGroup)

export default GlossaryGroup

// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class AppendixGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Appendices')} />)

  constructor(@inject('Appendix') appendix) {
    super()
    this.tools = [appendix]
  }
}

decorate(injectable(), AppendixGroup)

export default AppendixGroup

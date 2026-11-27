// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import i18next from 'i18next'
import {
  ToolGroup,
  LeftMenuTitle,
} from '../../../../../../ui/wax/wax-prosemirror-core'

class AppendixGroup extends ToolGroup {
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Appendices')} />)

  constructor(@inject('Appendix') appendix) {
    super()
    this._tools = [appendix]
  }
}

decorate(injectable(), AppendixGroup)

export default AppendixGroup

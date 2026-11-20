// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class AppendixGroup extends ToolGroup {
  static inject = ['Appendix']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Appendices')} />)

  constructor(appendix) {
    super()
    this._tools = [appendix]
  }
}

export default AppendixGroup

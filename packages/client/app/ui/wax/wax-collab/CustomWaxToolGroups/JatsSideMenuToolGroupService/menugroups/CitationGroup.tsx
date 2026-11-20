// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class CitationGroup extends ToolGroup {
  static inject = ['RefList', 'Reference', 'Callout']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Citations')} />)

  constructor(refList, reference, callout) {
    super()
    this._tools = [refList, reference, callout]
  }
}

export default CitationGroup

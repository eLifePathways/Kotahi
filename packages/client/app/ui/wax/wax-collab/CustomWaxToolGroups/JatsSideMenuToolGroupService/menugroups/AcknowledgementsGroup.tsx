// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class AcknowledgementsGroup extends ToolGroup {
  static inject = ['AcknowledgementsSection']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Acknowledgements')} />)

  constructor(acknowledgementsSection) {
    super()
    this._tools = [acknowledgementsSection]
  }
}

export default AcknowledgementsGroup

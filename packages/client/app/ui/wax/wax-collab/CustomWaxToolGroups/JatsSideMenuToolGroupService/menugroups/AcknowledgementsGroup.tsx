// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class AcknowledgementsGroup extends ToolGroup {
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Acknowledgements')} />)

  constructor(@inject('AcknowledgementsSection') acknowledgementsSection) {
    super()
    this._tools = [acknowledgementsSection]
  }
}

decorate(injectable(), AcknowledgementsGroup)

export default AcknowledgementsGroup

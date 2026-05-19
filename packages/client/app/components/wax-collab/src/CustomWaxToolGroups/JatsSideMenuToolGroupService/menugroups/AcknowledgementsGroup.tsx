// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class AcknowledgementsGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Acknowledgements')} />)

  constructor(@inject('AcknowledgementsSection') acknowledgementsSection) {
    super()
    this.tools = [acknowledgementsSection]
  }
}

decorate(injectable(), AcknowledgementsGroup)

export default AcknowledgementsGroup

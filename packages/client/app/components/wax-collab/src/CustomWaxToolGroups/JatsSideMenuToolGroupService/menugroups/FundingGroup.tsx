// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class FundingGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Funding Group')} />)

  constructor(
    @inject('FundingSource') fundingSource,
    @inject('AwardId') awardId,
    @inject('FundingStatement') fundingStatement,
  ) {
    super()
    this.tools = [fundingSource, awardId, fundingStatement]
  }
}

decorate(injectable(), FundingGroup)

export default FundingGroup

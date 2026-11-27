// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import i18next from 'i18next'
import {
  ToolGroup,
  LeftMenuTitle,
} from '../../../../../../ui/wax/wax-prosemirror-core'

class FundingGroup extends ToolGroup {
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Funding Group')} />)

  constructor(
    @inject('FundingSource') fundingSource,
    @inject('AwardId') awardId,
    @inject('FundingStatement') fundingStatement,
  ) {
    super()
    this._tools = [fundingSource, awardId, fundingStatement]
  }
}

decorate(injectable(), FundingGroup)

export default FundingGroup

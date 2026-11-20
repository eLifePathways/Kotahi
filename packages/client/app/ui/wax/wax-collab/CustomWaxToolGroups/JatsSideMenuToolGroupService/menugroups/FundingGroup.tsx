// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class FundingGroup extends ToolGroup {
  static inject = ['FundingSource', 'AwardId', 'FundingStatement']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Funding Group')} />)

  constructor(fundingSource, awardId, fundingStatement) {
    super()
    this._tools = [fundingSource, awardId, fundingStatement]
  }
}

export default FundingGroup

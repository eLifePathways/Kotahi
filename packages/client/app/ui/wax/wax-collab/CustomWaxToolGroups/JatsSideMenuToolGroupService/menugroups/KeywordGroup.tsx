// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'

class KeywordGroup extends ToolGroup {
  static inject = ['KeywordList', 'Keyword']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Keywords')} />)

  constructor(keywordList, keyword) {
    super()
    this._tools = [keywordList, keyword]
  }
}

export default KeywordGroup

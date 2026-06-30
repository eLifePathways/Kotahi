// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class KeywordGroup extends ToolGroup {
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Keywords')} />)

  constructor(@inject('KeywordList') keywordList, @inject('Keyword') keyword) {
    super()
    this._tools = [keywordList, keyword]
  }
}

decorate(injectable(), KeywordGroup)

export default KeywordGroup

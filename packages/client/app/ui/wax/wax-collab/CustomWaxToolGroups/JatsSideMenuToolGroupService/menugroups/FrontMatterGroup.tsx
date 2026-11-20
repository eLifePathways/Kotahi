// @ts-nocheck

import i18next from 'i18next'
import { ToolGroup, LeftMenuTitle } from '../../../../wax-prosemirror-core'
/* stylelint-disable */

class FrontMatterGroup extends ToolGroup {
  static inject = ['FrontMatter', 'Title', 'Abstract']

  title = (<LeftMenuTitle title={i18next.t('waxEditor.Front matter')} />)

  constructor(frontMatter, title, abstractSection) {
    super()
    this._tools = [frontMatter, title, abstractSection]
  }
}

export default FrontMatterGroup

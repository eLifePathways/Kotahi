// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'
/* stylelint-disable */

class FrontMatterGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Front matter')} />)

  constructor(
    @inject('FrontMatter') frontMatter,
    @inject('Title') title,
    @inject('Abstract') abstractSection,
  ) {
    super()
    this.tools = [frontMatter, title, abstractSection]
  }
}

decorate(injectable(), FrontMatterGroup)

export default FrontMatterGroup

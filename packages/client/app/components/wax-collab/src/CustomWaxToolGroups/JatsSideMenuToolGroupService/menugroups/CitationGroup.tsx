// @ts-nocheck

import { decorate, injectable, inject } from 'inversify'
import { ToolGroup, LeftMenuTitle } from 'wax-prosemirror-core'
import i18next from 'i18next'

class CitationGroup extends ToolGroup {
  tools = []
  title = (<LeftMenuTitle title={i18next.t('waxEditor.Citations')} />)

  constructor(
    @inject('RefList') refList,
    @inject('Reference') reference,
    @inject('Callout') callout,
    // @inject('ArticleTitle') articleTitle,
    // @inject('MixedCitationSpan') mixedCitationSpan,
    // @inject('AuthorGroup') authorGroup, // this isn't being shown currently
    // @inject('AuthorName') authorName,
    // @inject('JournalTitle') journalTitle,
    // @inject('Doi') doi,
    // @inject('FirstPage') firstPage,
    // @inject('LastPage') lastPage,
    // @inject('Volume') volume,
    // @inject('CitationLabel') citationLabel,
    // @inject('Issue') issue,
    // @inject('Year') year,
    // @inject('AnyStyleTool') anystyle,
  ) {
    super()
    this.tools = [
      refList,
      reference,
      callout,
      // mixedCitationSpan,
      // citationLabel,
      // authorGroup,
      // authorName,
      // articleTitle,
      // journalTitle,
      // doi,
      // volume,
      // issue,
      // year,
      // firstPage,
      // lastPage,
      // anystyle,
    ]
  }
}

decorate(injectable(), CitationGroup)

export default CitationGroup

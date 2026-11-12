import type { Element } from 'cheerio'
import OxaNodeConverter from '../OxaNodeConverter'
import type { OxaDocument, OxaNode } from '../../oxa.types'

export const ROOT_TAG = 'oxa-root'

class DocumentConverter extends OxaNodeConverter<OxaDocument> {
  readonly kind = 'block'
  readonly tier = 'standard'
  readonly oxaTypes = ['Document']
  protected readonly selectors = [ROOT_TAG]

  protected toOxa(el: Element, children: OxaNode[]): OxaDocument {
    return {
      type: 'Document',
      children: this.wrapInlineRuns(children),
    }
  }
}

export default DocumentConverter

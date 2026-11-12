import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock, OxaInline, OxaNode } from '../../oxa.types'

class ParagraphConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Paragraph']
  protected readonly selectors = ['p']
  protected readonly ignoredClasses = ['paragraph']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Paragraph',
      ...this.blockAttributes(el),
      children: children as OxaInline[],
    }
  }
}

export default ParagraphConverter

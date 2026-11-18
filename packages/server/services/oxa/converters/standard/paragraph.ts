import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock, OxaInline, OxaNode } from '../../oxa.types'

class ParagraphConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Paragraph']
  protected readonly selectors = ['p']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    const { classes = [], ...attributes } = this.oxaBlockAttributes(el)
    const kept = classes.filter(c => c !== 'paragraph')

    return {
      type: 'Paragraph',
      ...attributes,
      ...(kept.length ? { classes: kept } : {}),
      children: children as OxaInline[],
    }
  }

  fromOxa(node: OxaNode, children: string): string {
    // wax needs paragraphs to be `p.paragraph`
    const classes = ['paragraph', ...(node.classes ?? [])]
    const attributes = this.htmlBlockAttributes({ ...node, classes })
    return this.renderElement('p', attributes, children)
  }
}

export default ParagraphConverter

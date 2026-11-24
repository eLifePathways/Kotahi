import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock, OxaInline, OxaNode, OxaHeading } from '../../oxa.types'

class HeadingConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Heading']
  protected readonly selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Heading',
      ...this.oxaBlockAttributes(el),
      level: Number(el.name.slice(1)),
      children: children as OxaInline[],
    }
  }

  fromOxa(node: OxaNode, children: string): string {
    const { level } = node as OxaHeading
    return this.renderElement(
      `h${level}`,
      this.htmlBlockAttributes(node),
      children,
    )
  }
}

export default HeadingConverter

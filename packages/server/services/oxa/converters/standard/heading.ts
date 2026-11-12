import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock, OxaInline, OxaNode } from '../../oxa.types'

class HeadingConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Heading']
  protected readonly selectors = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Heading',
      ...this.blockAttributes(el),
      level: Number(el.name.slice(1)),
      children: children as OxaInline[],
    }
  }
}

export default HeadingConverter

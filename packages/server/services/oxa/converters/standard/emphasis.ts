import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode } from '../../oxa.types'

class EmphasisConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Emphasis']
  protected readonly selectors = ['em', 'i']

  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Emphasis', children: children as OxaInline[] }
  }

  fromOxa(node: OxaNode, children: string): string {
    return this.renderElement('em', {}, children)
  }
}

export default EmphasisConverter

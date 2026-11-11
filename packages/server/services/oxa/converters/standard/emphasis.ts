import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode } from '../../oxa.types'

class EmphasisConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Emphasis']
  protected readonly selectors = ['em', 'i']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Emphasis', children: children as OxaInline[] }
  }
}

export default EmphasisConverter

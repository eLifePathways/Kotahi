import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode } from '../../oxa.types'

class StrongConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Strong']
  protected readonly selectors = ['strong', 'b']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Strong', children: children as OxaInline[] }
  }
}

export default StrongConverter

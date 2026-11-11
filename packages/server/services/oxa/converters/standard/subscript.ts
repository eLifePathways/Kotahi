import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode } from '../../oxa.types'

class SubscriptConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Subscript']
  protected readonly selectors = ['sub']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Subscript', children: children as OxaInline[] }
  }
}

export default SubscriptConverter

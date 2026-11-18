import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode } from '../../oxa.types'

class SuperscriptConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Superscript']
  protected readonly selectors = ['sup']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Superscript', children: children as OxaInline[] }
  }

  fromOxa(node: OxaNode, children: string): string {
    return this.renderElement('sup', {}, children)
  }
}

export default SuperscriptConverter

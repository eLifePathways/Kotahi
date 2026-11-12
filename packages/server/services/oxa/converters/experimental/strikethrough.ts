import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import { INLINE_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaInline, OxaNode } from '../../oxa.types'

// Experimental: no RFC covers strikethrough
class StrikethroughConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Strikethrough']
  readonly schema = nodeSchema('Strikethrough', { children: INLINE_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['s', 'span.strikethrough']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null
    return { type: 'Strikethrough', children: children as OxaInline[] }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }
}

export default StrikethroughConverter

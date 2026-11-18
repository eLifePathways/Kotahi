import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

// Experimental: block quotes are deferred by RFC0003
class BlockQuoteConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['BlockQuote']
  readonly schema = nodeSchema('BlockQuote', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['blockquote']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'BlockQuote',
      ...this.oxaBlockAttributes(el),
      children,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }

  fromOxa(node: OxaNode, children: string): string {
    return this.renderElement(
      'blockquote',
      this.htmlBlockAttributes(node),
      children,
    )
  }
}

export default BlockQuoteConverter

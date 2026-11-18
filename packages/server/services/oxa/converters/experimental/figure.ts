import type { Element } from 'cheerio'
import {
  BlockConverter,
  childrenOf,
  type FromOxaContext,
} from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

// Experimental: figures are deferred by the Images and Media RFC
class FigureConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Figure']
  readonly schema = nodeSchema('Figure', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['figure']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Figure',
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

  fromOxa(
    node: OxaNode,
    children: string,
    { childList }: FromOxaContext,
  ): string {
    const nodes = childrenOf(node)

    /**
     * Wax has no figure around tables: its figure only holds images and a
     * figcaption, and a table keeps its caption inside itself. The table has
     * already rendered the caption into its <caption>, so return just the
     * tables. Any other children of this figure are dropped.
     */
    const tables = childList.filter((_, index) => nodes[index].type === 'Table')
    if (tables.length) return tables.join('')

    return this.renderElement(
      'figure',
      this.htmlBlockAttributes(node),
      children,
    )
  }
}

export default FigureConverter

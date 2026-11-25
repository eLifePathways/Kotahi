import type { Element } from 'cheerio'
import {
  BlockConverter,
  childrenOf,
  type FromOxaContext,
} from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

// Experimental: tables are deferred by RFC0003
class TableConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Table']
  readonly schema = nodeSchema('Table', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['table']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    const captions = children.filter(child => child.type === 'Caption')
    const rows = children.filter(child => child.type !== 'Caption')

    if (!rows.length) return null

    const table: OxaBlock = {
      type: 'Table',
      ...this.oxaBlockAttributes(el),
      children: rows,
    }

    if (!captions.length) return table
    return { type: 'Figure', children: [...captions, table] }
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }

  fromOxa(
    node: OxaNode,
    _children: string,
    { parent, childList, renderChildren }: FromOxaContext,
  ): string {
    const nodes = childrenOf(node)

    /**
     * Wax keeps a table's caption inside the table, as <caption>. In OXA the
     * caption sits next to the table, in the Figure wrapping both, so collect
     * it from there. Render only the caption's content, since the walker
     * already rendered the Caption itself as a <figcaption>, which the Figure
     * discards. Captions placed directly inside the table are moved into the
     * <caption> too, so that only rows end up in <tbody>.
     */
    const siblings = parent?.type === 'Figure' ? childrenOf(parent) : []

    const captions = [...siblings, ...nodes]
      .filter(child => child.type === 'Caption')
      .map(caption => renderChildren(caption))
      .join('')

    const rows = childList.filter((_, index) => nodes[index].type !== 'Caption')
    const caption = captions ? this.renderElement('caption', {}, captions) : ''
    const body = this.renderElement('tbody', {}, rows.join(''))

    return this.renderElement(
      'table',
      this.htmlBlockAttributes(node),
      `${caption}${body}`,
    )
  }
}

export default TableConverter

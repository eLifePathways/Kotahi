import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
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
      ...this.blockAttributes(el),
      children: rows,
    }

    if (!captions.length) return table
    return { type: 'Figure', children: [...captions, table] }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }
}

export default TableConverter

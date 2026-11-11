import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type {
  OxaBlock,
  OxaInline,
  OxaNode,
  OxaParagraph,
} from '../../oxa.types'

// Experimental: tables are deferred by RFC0003
class TableRowConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['TableRow']
  readonly schema = nodeSchema('TableRow', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['tr']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null
    return { type: 'TableRow', children }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(el: Element, children: OxaNode[]): OxaParagraph | null {
    const cells = children.filter(
      (child): child is OxaParagraph => child.type === 'Paragraph',
    )

    if (!cells.length) return null

    const separator: OxaInline = { type: 'Text', value: ' | ' }

    return {
      type: 'Paragraph',
      children: cells.flatMap((cell, index) => [
        ...(index ? [separator] : []),
        ...cell.children,
      ]),
    }
  }
}

export default TableRowConverter

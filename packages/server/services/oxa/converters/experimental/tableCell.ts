import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type {
  OxaBlock,
  OxaInline,
  OxaNode,
  OxaParagraph,
} from '../../oxa.types'

const isHeaderCell = (cell: Element): boolean => {
  const section = cell.parent?.parent
  return (
    cell.name === 'th' ||
    (!!section && 'attribs' in section && section.name === 'thead')
  )
}

// Experimental: tables are deferred by RFC0003
class TableCellConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['TableCell']
  readonly schema = nodeSchema(
    'TableCell',
    {
      header: { type: 'boolean' },
      colspan: { type: 'integer' },
      rowspan: { type: 'integer' },
      children: ANY_CHILDREN,
    },
    ['children'],
  )
  protected readonly selectors = ['td', 'th']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    const colspan = Number.parseInt(el.attribs.colspan, 10)
    const rowspan = Number.parseInt(el.attribs.rowspan, 10)

    return {
      type: 'TableCell',
      ...(isHeaderCell(el) ? { header: true } : {}),
      ...(colspan > 1 ? { colspan } : {}),
      ...(rowspan > 1 ? { rowspan } : {}),
      children,
    }
  }

  protected fallback(el: Element, children: OxaNode[]): OxaParagraph {
    const separator: OxaInline = { type: 'Text', value: ' ' }

    const inlines = children.reduce<OxaInline[]>((acc, child) => {
      if (child.type === 'Paragraph' || child.type === 'Heading') {
        return [...acc, ...(acc.length ? [separator] : []), ...child.children]
      }

      return this.options.isBlock(child) ? acc : [...acc, child as OxaInline]
    }, [])

    return { type: 'Paragraph', children: inlines }
  }
}

export default TableCellConverter

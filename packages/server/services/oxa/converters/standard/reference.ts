import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type {
  OxaBlock,
  OxaInline,
  OxaNode,
  OxaReference,
} from '../../oxa.types'

class ReferenceConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Reference']
  protected readonly selectors = ['p.ref']
  private count = 0

  reset(): void {
    this.count = 0
  }

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    this.count += 1
    const id = el.attribs.id || `ref-${this.count}`
    const value = el.attribs['data-structure']
    const structure = value ? JSON.parse(value) : null

    const csl: Record<string, unknown> =
      structure && typeof structure === 'object' && !Array.isArray(structure)
        ? { ...(structure as Record<string, unknown>) }
        : {}

    if (!csl.id) csl.id = id
    if (!csl.type) csl.type = 'document'
    // RFC: Citations (RFC0005) - Reference.id must equal csl["citation-key"]
    if (this.isEnabled('rfc')) csl['citation-key'] = id

    const node: OxaReference = { type: 'Reference', id, csl }
    if (children.length) node.children = children as OxaInline[]

    return node
  }

  fromOxa(node: OxaNode, children: string): string {
    const { id, csl } = node as OxaReference

    return this.renderElement(
      'p',
      {
        class: 'ref',
        id,
        'data-structure': JSON.stringify(csl),
      },
      children,
    )
  }
}

export default ReferenceConverter

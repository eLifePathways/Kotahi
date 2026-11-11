import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import type {
  OxaBlock,
  OxaInline,
  OxaNode,
  OxaReference,
} from '../../oxa.types'

// RFC: Citations (RFC0005) - Reference.identifier must equal csl["citation-key"]
const applyReferenceIdentifier = (reference: OxaReference): void => {
  const citationKey = (reference.csl['citation-key'] as string) || reference.id
  reference.identifier = citationKey
  reference.csl['citation-key'] = citationKey
}

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

    const node: OxaReference = { type: 'Reference', id, csl }
    if (children.length) node.children = children as OxaInline[]

    if (this.isEnabled('rfc')) applyReferenceIdentifier(node)

    return node
  }
}

export default ReferenceConverter

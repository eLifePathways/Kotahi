import { text, type Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaCite, OxaInline, OxaCiteGroup, OxaNode } from '../../oxa.types'

const citationIds = (el: Element): string[] => {
  const value = el.attribs['data-citationitems']
  const items = value ? JSON.parse(value) : null

  return (Array.isArray(items) ? items : [])
    .map(item => item?.id)
    .filter(Boolean)
    .map(String)
}

class CitationCalloutConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['CiteGroup', 'Cite']
  protected readonly selectors = ['span.callout']

  matches(el: Element): boolean {
    return super.matches(el) && citationIds(el).length > 0
  }

  protected toOxa(el: Element): OxaInline | null {
    const cites: OxaCite[] = citationIds(el).map(xref => ({
      type: 'Cite',
      xref,
    }))

    const calloutText = text([el]).trim()

    return {
      type: 'CiteGroup',
      ...(el.attribs.id ? { id: el.attribs.id } : {}),
      kind: 'parenthetical',
      children: cites,
      ...(calloutText ? { data: { calloutText } } : {}),
    }
  }

  fromOxa(node: OxaNode): string {
    const group = node.type === 'CiteGroup' ? (node as OxaCiteGroup) : null
    const cites = group ? group.children : [node as OxaCite]
    const label = String(group?.data?.calloutText ?? '')
    const items = cites.map(cite => ({ id: cite.xref }))

    return this.renderElement(
      'span',
      {
        class: 'callout',
        id: node.id,
        'data-citationitems': JSON.stringify(items),
        'data-citationcallouttext': label,
      },
      this.escapeHtml(label),
    )
  }
}

export default CitationCalloutConverter

import { text, type Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaCite, OxaInline } from '../../oxa.types'

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

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element): OxaInline | null {
    const cites: OxaCite[] = citationIds(el).map(xref => ({
      type: 'Cite',
      xref,
    }))

    const calloutText = text([el]).trim()

    return {
      type: 'CiteGroup',
      kind: 'parenthetical',
      children: cites,
      ...(calloutText ? { data: { calloutText } } : {}),
    }
  }
}

export default CitationCalloutConverter

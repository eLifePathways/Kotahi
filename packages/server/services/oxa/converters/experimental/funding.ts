import type { Element } from 'cheerio'
import {
  BlockConverter,
  type RenderInlines,
  getClasses,
  normalizeInlineElements,
} from '../OxaNodeConverter'
import type { OxaBlock, OxaInline, OxaNode } from '../../oxa.types'
import ParagraphConverter from '../standard/paragraph'

type FundingAward = { source?: OxaInline[]; awardId?: OxaInline[] }

const FUNDING_CLASSES = ['fundingsource', 'awardid', 'fundingstatement']

// Experimental: RFC0006 reserves metadata.funding but leaves its shape undefined
class FundingConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes: string[] = []
  protected readonly selectors = FUNDING_CLASSES.map(c => `p.${c}`)
  private readonly paragraph = new ParagraphConverter(this.options)
  private awards: FundingAward[] = []
  private statements: OxaInline[][] = []

  reset(): void {
    this.awards = []
    this.statements = []
  }

  metadata(): Record<string, unknown> {
    return {
      ...(this.awards.length ? { funding: this.awards } : {}),
      ...(this.statements.length ? { fundingStatement: this.statements } : {}),
    }
  }

  fromMetadata(
    metadata: Record<string, unknown>,
    renderInlines: RenderInlines,
  ): string {
    if (!this.enabled) return ''

    const awards = Array.isArray(metadata.funding) ? metadata.funding : []

    const statements = Array.isArray(metadata.fundingStatement)
      ? metadata.fundingStatement
      : []

    const paragraph = (className: string, value: unknown): string => {
      const html = renderInlines(value)
      return html ? this.renderElement('p', { class: className }, html) : ''
    }

    return [
      ...awards.flatMap(award => [
        paragraph('fundingsource', award?.source),
        paragraph('awardid', award?.awardId),
      ]),
      ...statements.map(statement => paragraph('fundingstatement', statement)),
    ].join('')
  }

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    const value = normalizeInlineElements(children as OxaInline[])
    if (!value.length) return null

    if (getClasses(el).includes('fundingsource')) {
      this.awards.push({ source: value })
    } else if (getClasses(el).includes('awardid')) {
      const last = this.awards[this.awards.length - 1]
      if (last && !last.awardId) last.awardId = value
      else this.awards.push({ awardId: value })
    } else {
      this.statements.push(value)
    }

    return null
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return this.paragraph.convertToOxa(el, children)
  }

  // eslint-disable-next-line class-methods-use-this
  fromOxa(): string {
    return ''
  }
}

export default FundingConverter

import { text, type Element } from 'cheerio'
import { BlockConverter, getClasses } from '../OxaNodeConverter'
import type { OxaBlock, OxaNode } from '../../oxa.types'
import ParagraphConverter from '../standard/paragraph'

type FundingAward = { source: string; awardId?: string }

const FUNDING_CLASSES = ['fundingsource', 'awardid', 'fundingstatement']

// Experimental: RFC0006 reserves metadata.funding but leaves its shape undefined
class FundingConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes: string[] = []
  protected readonly selectors = FUNDING_CLASSES.map(c => `p.${c}`)
  private readonly paragraph = new ParagraphConverter(this.options)
  private awards: FundingAward[] = []
  private statements: string[] = []

  reset(): void {
    this.awards = []
    this.statements = []
  }

  metadata(): Record<string, unknown> {
    return {
      ...(this.awards.length ? { funding: this.awards } : {}),
      ...(this.statements.length
        ? { fundingStatement: this.statements.join('\n') }
        : {}),
    }
  }

  protected toOxa(el: Element): OxaBlock | null {
    const value = text([el]).trim()
    if (!value) return null

    if (getClasses(el).includes('fundingsource')) {
      this.awards.push({ source: value })
    } else if (getClasses(el).includes('awardid')) {
      const last = this.awards[this.awards.length - 1]
      if (last && !last.awardId) last.awardId = value
      else this.awards.push({ source: '', awardId: value })
    } else {
      this.statements.push(value)
    }

    return null
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return this.paragraph.convert(el, children)
  }
}

export default FundingConverter

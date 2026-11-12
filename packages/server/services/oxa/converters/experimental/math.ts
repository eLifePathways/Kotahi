import { text, type Element } from 'cheerio'
import { BlockConverter, InlineConverter } from '../OxaNodeConverter'
import { nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaInline } from '../../oxa.types'

// Experimental: no RFC covers display math
export class MathConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Math']
  readonly schema = nodeSchema('Math', { value: { type: 'string' } }, ['value'])
  readonly leaf = true
  protected readonly selectors = ['math-display']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element): OxaBlock | null {
    return { type: 'Math', value: text([el]) }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(el: Element): OxaBlock {
    return { type: 'Code', language: 'latex', value: text([el]) }
  }
}

// Experimental: InlineMath only appears as an example in RFC0002
export class InlineMathConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['InlineMath']
  readonly schema = nodeSchema('InlineMath', { value: { type: 'string' } }, [
    'value',
  ])
  readonly leaf = true
  protected readonly selectors = ['math-inline']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element): OxaInline | null {
    return { type: 'InlineMath', value: text([el]) }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(el: Element): OxaInline {
    return { type: 'InlineCode', language: 'latex', value: text([el]) }
  }
}

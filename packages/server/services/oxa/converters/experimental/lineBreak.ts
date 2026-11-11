import { InlineConverter } from '../OxaNodeConverter'
import { nodeSchema } from '../nodeSchema'
import type { OxaInline } from '../../oxa.types'

// Experimental: no RFC covers line breaks
class LineBreakConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Break']
  readonly schema = nodeSchema('Break')
  readonly leaf = true
  protected readonly selectors = ['br']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(): OxaInline | null {
    return { type: 'Break' }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(): OxaInline {
    return { type: 'Text', value: '\n' }
  }
}

export default LineBreakConverter

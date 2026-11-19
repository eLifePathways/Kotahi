import { InlineConverter } from '../OxaNodeConverter'
import { nodeSchema } from '../nodeSchema'
import type { OxaInline } from '../../oxa.types'

// Experimental: no RFC covers line breaks
class LineBreakConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Break']
  readonly schema = nodeSchema('Break')
  protected readonly selectors = ['br']

  protected toOxa(): OxaInline {
    return { type: 'Break' }
  }

  protected fallback(): OxaInline {
    return { type: 'Text', value: '\n' }
  }

  fromOxa(): string {
    return this.renderElement('br')
  }
}

export default LineBreakConverter

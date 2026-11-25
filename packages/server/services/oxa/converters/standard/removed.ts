import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline } from '../../oxa.types'

/**
 * Drops the elements that it matches.
 */
class RemovedConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes: string[] = []
  readonly skipChildren = true
  protected readonly selectors = ['script', 'style', 'span.deletion']

  protected toOxa(): OxaInline | null {
    return null
  }

  fromOxa(): string {
    return ''
  }
}

export default RemovedConverter

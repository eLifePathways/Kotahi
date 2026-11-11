import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline } from '../../oxa.types'

/**
 * Drops the elements that it matches.
 */
class RemovedConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes: string[] = []
  readonly leaf = true
  protected readonly selectors = ['script', 'style', 'span.deletion']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(): OxaInline | null {
    return null
  }
}

export default RemovedConverter

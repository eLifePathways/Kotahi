import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock } from '../../oxa.types'

class ThematicBreakConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['ThematicBreak']
  readonly leaf = true
  protected readonly selectors = ['hr']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(): OxaBlock | null {
    return { type: 'ThematicBreak' }
  }
}

export default ThematicBreakConverter

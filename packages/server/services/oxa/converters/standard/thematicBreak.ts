import { BlockConverter } from '../OxaNodeConverter'
import type { OxaBlock } from '../../oxa.types'

class ThematicBreakConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['ThematicBreak']
  protected readonly selectors = ['hr']

  protected toOxa(): OxaBlock | null {
    return { type: 'ThematicBreak' }
  }

  fromOxa(): string {
    return this.renderElement('hr')
  }
}

export default ThematicBreakConverter

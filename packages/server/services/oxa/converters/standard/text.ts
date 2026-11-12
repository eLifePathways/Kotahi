import type { AnyNode } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline } from '../../oxa.types'

class TextConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Text']
  readonly leaf = true
  protected readonly selectors: string[] = []

  // eslint-disable-next-line class-methods-use-this
  matches(node: AnyNode): boolean {
    return String(node.type) === 'text'
  }

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(node: AnyNode): OxaInline | null {
    const { data } = node as AnyNode & { data: string }
    return data ? { type: 'Text', value: data } : null
  }
}

export default TextConverter

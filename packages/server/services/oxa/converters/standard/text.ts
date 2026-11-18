import type { AnyNode } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import type { OxaInline, OxaNode, OxaText } from '../../oxa.types'

class TextConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Text']
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

  fromOxa(node: OxaNode): string {
    return this.escapeHtml((node as OxaText).value)
  }
}

export default TextConverter

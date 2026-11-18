import { text, type Element } from 'cheerio'
import { BlockConverter, InlineConverter } from '../OxaNodeConverter'
import type {
  OxaBlock,
  OxaInline,
  OxaCode,
  OxaInlineCode,
  OxaNode,
} from '../../oxa.types'

/**
 * Wax does not actually store the programming language, but keeping a
 * theoretical data-language attribute here. If we want to support this in Wax,
 * we'd just add this attribute and oxa conversions would work.
 */

export class CodeBlockConverter extends BlockConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['Code']
  readonly skipChildren = true
  protected readonly selectors = ['pre']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element): OxaBlock | null {
    const language = el.attribs['data-language']

    return {
      type: 'Code',
      value: text([el]),
      ...(language ? { language } : {}),
    }
  }

  fromOxa(node: OxaNode): string {
    const { value, language } = node as OxaCode
    const code = this.renderElement('code', {}, this.escapeHtml(value))
    return this.renderElement('pre', { 'data-language': language }, code)
  }
}

export class InlineCodeConverter extends InlineConverter {
  readonly tier = 'standard'
  readonly oxaTypes = ['InlineCode']
  readonly skipChildren = true
  protected readonly selectors = ['code']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element): OxaInline | null {
    const language = el.attribs['data-language']

    return {
      type: 'InlineCode',
      value: text([el]),
      ...(language ? { language } : {}),
    }
  }

  fromOxa(node: OxaNode): string {
    const { value, language } = node as OxaInlineCode
    return this.renderElement(
      'code',
      { 'data-language': language },
      this.escapeHtml(value),
    )
  }
}

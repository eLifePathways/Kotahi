import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import { INLINE_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaInline, OxaNode } from '../../oxa.types'

// Experimental: no RFC covers footnotes
class FootnoteConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Footnote']
  readonly schema = nodeSchema('Footnote', { children: INLINE_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['footnote']
  private notes: OxaInline[][] = []

  reset(): void {
    this.notes = []
  }

  protected endBlocks(): OxaBlock[] {
    if (!this.notes.length) return []

    return [
      { type: 'ThematicBreak' },
      ...this.notes.map(
        (note, index): OxaBlock => ({
          type: 'Paragraph',
          children: [{ type: 'Text', value: `${index + 1}. ` }, ...note],
        }),
      ),
    ]
  }

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null

    return {
      type: 'Footnote',
      ...(el.attribs.id ? { id: el.attribs.id } : {}),
      children,
    }
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    if (!children.length) return null

    this.notes.push(children as OxaInline[])

    return {
      type: 'Superscript',
      children: [{ type: 'Text', value: String(this.notes.length) }],
    }
  }
}

export default FootnoteConverter

import type { Element } from 'cheerio'
import { InlineConverter } from '../OxaNodeConverter'
import { INLINE_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaInline, OxaNode } from '../../oxa.types'

// Experimental: no RFC covers links
class LinkConverter extends InlineConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Link']
  readonly schema = nodeSchema(
    'Link',
    {
      url: { type: 'string' },
      title: { type: 'string' },
      children: INLINE_CHILDREN,
    },
    ['url', 'children'],
  )
  protected readonly selectors = ['a']

  matches(el: Element): boolean {
    return super.matches(el) && !!el.attribs.href
  }

  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null

    return {
      type: 'Link',
      url: el.attribs.href,
      ...(el.attribs.title ? { title: el.attribs.title } : {}),
      children,
    }
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }

  fromOxa(node: OxaNode, children: string): string {
    const { url, title } = node as { url?: string; title?: string }
    return this.renderElement('a', { href: url, title }, children)
  }
}

export default LinkConverter

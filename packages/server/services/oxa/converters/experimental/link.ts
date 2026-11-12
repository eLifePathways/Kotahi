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

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaInline | null {
    if (!children.length) return null

    return {
      type: 'Link',
      url: el.attribs.href,
      ...(el.attribs.title ? { title: el.attribs.title } : {}),
      children,
    }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    return children
  }
}

export default LinkConverter

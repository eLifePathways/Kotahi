import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'
import { listStart } from './listItem'

// Experimental: lists are deferred by RFC0003
class ListConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['List']
  readonly schema = nodeSchema(
    'List',
    {
      ordered: { type: 'boolean' },
      start: { type: 'integer' },
      children: ANY_CHILDREN,
    },
    ['ordered', 'children'],
  )
  protected readonly selectors = ['ul', 'ol']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    const ordered = el.name === 'ol'
    const start = listStart(el)

    return {
      type: 'List',
      ordered,
      ...(ordered && start !== 1 ? { start } : {}),
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

export default ListConverter

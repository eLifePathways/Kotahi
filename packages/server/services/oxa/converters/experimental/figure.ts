import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

// Experimental: figures are deferred by the Images and Media RFC
class FigureConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Figure']
  readonly schema = nodeSchema('Figure', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['figure']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Figure',
      ...this.blockAttributes(el),
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

export default FigureConverter

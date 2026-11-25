import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

// Experimental: captions are deferred by the Images and Media RFC
class CaptionConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Caption']
  readonly schema = nodeSchema('Caption', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['caption', 'figcaption']

  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    return {
      type: 'Caption',
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
    return this.renderElement('figcaption', {}, children)
  }
}

export default CaptionConverter

import type { Element } from 'cheerio'
import { BlockConverter, getClasses } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode } from '../../oxa.types'

const SECTION_KINDS: Record<string, string> = {
  abstractSection: 'abstract',
  acknowledgementsSection: 'acknowledgements',
  appendix: 'appendix',
  frontmatter: 'frontmatter',
  glossary: 'glossary',
  reflist: 'references',
}

// Experimental: no RFC covers sections
class SectionConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['Section']
  readonly schema = nodeSchema('Section', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['section']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    if (!children.length) return null

    const classes = getClasses(el).map(c => SECTION_KINDS[c] ?? c)

    return {
      type: 'Section',
      ...(el.attribs.id ? { id: el.attribs.id } : {}),
      ...(classes.length ? { classes } : {}),
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

export default SectionConverter

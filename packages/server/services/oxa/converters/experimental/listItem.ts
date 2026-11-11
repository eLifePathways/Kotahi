import type { Element } from 'cheerio'
import { BlockConverter } from '../OxaNodeConverter'
import { ANY_CHILDREN, nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaNode, OxaParagraph } from '../../oxa.types'

export const listStart = (el: Element): number =>
  Number.parseInt(el.attribs.start, 10) || 1

const listMarker = (item: Element): string => {
  const { parent } = item
  if (!parent || !('attribs' in parent) || parent.name !== 'ol') return '• '
  const index = parent.children
    .filter(child => 'attribs' in child && child.name === 'li')
    .indexOf(item)
  return `${listStart(parent) + index}. `
}

const prependMarker = (blocks: OxaBlock[], marker: string): OxaBlock[] => {
  const [first, ...rest] = blocks

  if (first?.type === 'Paragraph') {
    const paragraph = first as OxaParagraph

    return [
      {
        ...paragraph,
        children: [{ type: 'Text', value: marker }, ...paragraph.children],
      },
      ...rest,
    ]
  }

  return [
    { type: 'Paragraph', children: [{ type: 'Text', value: marker }] },
    ...blocks,
  ]
}

// Experimental: lists are deferred by RFC0003
class ListItemConverter extends BlockConverter {
  readonly tier = 'experimental'
  readonly oxaTypes = ['ListItem']
  readonly schema = nodeSchema('ListItem', { children: ANY_CHILDREN }, [
    'children',
  ])
  protected readonly selectors = ['li']

  // eslint-disable-next-line class-methods-use-this
  protected toOxa(el: Element, children: OxaNode[]): OxaBlock | null {
    return { type: 'ListItem', children }
  }

  protected fallback(
    el: Element,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null {
    /**
     * Add a bullet or a number at the start of the list so that it is still
     * legible as a list when experimental features are off.
     */
    return prependMarker(this.wrapInlineRuns(children), listMarker(el))
  }
}

export default ListItemConverter

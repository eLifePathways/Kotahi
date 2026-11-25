import type { AnyNode, Element } from 'cheerio'

import type { OxaBlock, OxaInline, OxaNode } from '../oxa.types'
import type { NodeSchema } from './nodeSchema'
import type { OxaFileUrl, OxaSourceFile } from '../OxaConverter'

type NodeKind = 'block' | 'inline'

export type IsBlock = (node: OxaNode) => boolean
type OxaBlockAttributes = { id?: string; classes?: string[] }
export type OxaTier = 'standard' | 'rfc' | 'experimental'
export type ConverterOptions = {
  enableRFC: boolean
  enableExperimental: boolean
  isBlock: IsBlock
}
export type ExportConverterOptions = ConverterOptions & {
  fileUrl: OxaFileUrl
  files: OxaSourceFile[]
}
type HtmlAttributes = Record<string, string | number | boolean | undefined>
export type RenderChildren = (parent: OxaNode, nodes?: OxaNode[]) => string
export type RenderInlines = (value: unknown) => string
export type FromOxaContext = {
  parent: OxaNode | null
  childList: string[]
  renderChildren: RenderChildren
}

export const getClasses = (el: Element): string[] =>
  (el.attribs.class || '').split(/\s+/).filter(Boolean)

export const childrenOf = (node: OxaNode): OxaNode[] =>
  'children' in node && Array.isArray(node.children)
    ? (node.children as OxaNode[])
    : []

export const normalizeInlineElements = (inlines: OxaInline[]): OxaInline[] => {
  const merged: OxaInline[] = []

  // merge adjacent text nodes
  inlines.forEach(inline => {
    const previous = merged[merged.length - 1]

    if (inline.type === 'Text' && previous?.type === 'Text') {
      merged[merged.length - 1] = {
        type: 'Text',
        value: `${previous.value}${inline.value}`.replace(/ {2,}/g, ' '),
      }
    } else {
      merged.push(inline)
    }
  })

  // drop empty text nodes
  return merged.filter(inline => !(inline.type === 'Text' && !inline.value))
}

const normalizeChildren = <N extends OxaNode>(node: N): N =>
  'children' in node && Array.isArray(node.children)
    ? ({
        ...node,
        children: normalizeInlineElements(node.children as OxaInline[]),
      } as N)
    : node

abstract class OxaNodeConverter<T extends OxaNode> {
  abstract readonly kind: NodeKind
  abstract readonly tier: OxaTier
  abstract readonly oxaTypes: string[]
  readonly skipChildren: boolean = false // does not convert children if true
  readonly schema: NodeSchema | null = null
  protected abstract readonly selectors: string[]
  protected readonly options: ConverterOptions

  constructor(options: ConverterOptions) {
    this.options = options
  }

  matches(node: AnyNode): boolean {
    if (!('attribs' in node)) return false

    return this.selectors.some(selector => {
      const [tag, ...classNames] = selector.split('.')
      return (
        node.name === tag && classNames.every(c => getClasses(node).includes(c))
      )
    })
  }

  get enabled(): boolean {
    return this.isEnabled(this.tier)
  }

  protected isEnabled(tier: OxaTier): boolean {
    if (tier === 'rfc') return this.options.enableRFC
    if (tier === 'experimental') return this.options.enableExperimental
    return true
  }

  protected escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
  }

  protected renderElement(
    tag: string,
    attributes: HtmlAttributes = {},
    content?: string,
  ): string {
    const attrs = Object.entries(attributes)
      // a simple !!value would drop a 0 value, which is a valid attribute value
      .filter(([, value]) => typeof value === 'number' || !!value)
      .map(([name, value]) =>
        value === true ? name : `${name}="${this.escapeHtml(String(value))}"`,
      )
      .join(' ')

    const openingTag = attrs ? `<${tag} ${attrs}>` : `<${tag}>`

    if (content === undefined) return openingTag
    return `${openingTag}${content}</${tag}>`
  }

  convertToOxa(node: AnyNode, children: OxaNode[]): OxaNode | OxaNode[] | null {
    if (!this.enabled && !this.fallback) {
      throw new Error(`${this.constructor.name} (${this.tier}) has no fallback`)
    }

    const result = this.enabled
      ? this.toOxa(node, children)
      : this.fallback(node, children)

    if (!result) return null
    if (Array.isArray(result)) return result.map(normalizeChildren)
    return normalizeChildren(result)
  }

  reset(): void {}

  /**
   * Allows converters to define additions to metadata, which will then be
   * collected by OxaConverter.
   */
  metadata(): Record<string, unknown> {
    return {}
  }

  fromMetadata(
    _metadata: Record<string, unknown>,
    _renderInlines: RenderInlines,
  ): string {
    return ''
  }

  collectEndBlocks(): OxaBlock[] {
    return this.endBlocks().map(normalizeChildren)
  }

  /**
   * This allows a converter to define the content that it wants to append at
   * the end of the document. It is only called by collectEndBlocks, which in
   * turn is called only by OxaConverter, which will do the actual appending.
   */
  protected endBlocks(): OxaBlock[] {
    return []
  }

  // Used by some converters to wrap loose inline children in a paragraph.
  protected wrapInlineRuns(nodes: OxaNode[]): OxaBlock[] {
    const blocks: OxaBlock[] = []
    let loose: OxaInline[] = []

    // if there's loose nodes, wrap them in a paragraph and reset
    const wrapLoose = (): void => {
      const children = normalizeInlineElements(loose)
      if (children.length) blocks.push({ type: 'Paragraph', children })
      loose = []
    }

    /**
     * If we encounter a block, this means we could have a mix of inline and
     * block elements as children. Instead of wrapping all children in a single
     * block, we need to return multiple blocks.
     *
     * eg.  loose_inline, loose_inline, block, loose_inline
     *      -> should return
     *      <p>loose_inline, loose_inline</p>, block, <p>loose_inline</p>
     *
     * If only blocks are encountered, these will pass through unchanged.
     */
    nodes.forEach(node => {
      if (this.options.isBlock(node)) {
        wrapLoose() // push a block that wraps anything loose up to this point
        blocks.push(node as OxaBlock) // push block encountered
      } else {
        loose.push(node as OxaInline)
      }
    })

    /**
     * Wrap whatever's left in a block.
     * if no blocks were encountered, this will wrap all loose elements in a
     * single block.
     */
    wrapLoose()

    return blocks
  }

  protected abstract toOxa(node: AnyNode, children: OxaNode[]): T | null

  protected fallback?(
    node: AnyNode,
    children: OxaNode[],
  ): OxaNode | OxaNode[] | null

  abstract fromOxa(
    node: OxaNode,
    children: string,
    context: FromOxaContext,
  ): string
}

export abstract class BlockConverter extends OxaNodeConverter<OxaBlock> {
  readonly kind = 'block'

  protected oxaBlockAttributes(el: Element): OxaBlockAttributes {
    const attributes: OxaBlockAttributes = {}

    const classes = getClasses(el)

    if (el.attribs.id) attributes.id = el.attribs.id
    if (classes.length) attributes.classes = classes
    return attributes
  }

  protected htmlBlockAttributes(node: OxaNode): HtmlAttributes {
    return { id: node.id, class: (node.classes ?? []).join(' ') }
  }
}

export abstract class InlineConverter extends OxaNodeConverter<OxaInline> {
  readonly kind = 'inline'
}

export type AnyConverter = OxaNodeConverter<OxaNode>

export default OxaNodeConverter

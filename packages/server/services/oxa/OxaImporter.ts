import { load, type AnyNode } from 'cheerio'
import isPlainObject from 'lodash/isPlainObject'

import {
  type RenderChildren,
  type RenderInlines,
  childrenOf,
} from './converters/OxaNodeConverter'
import type { OxaDocument, OxaInline, OxaNode } from './oxa.types'

import OxaConverter, {
  BODY_METADATA_KEY,
  type OxaSource,
  type OxaSourceMetadata,
} from './OxaConverter'

const moveInlineImagesIntoFigures = (html: string): string => {
  const $ = load(html, null, false)
  const images = $('img').filter(
    (_, image) => !$(image).closest('figure').length,
  )

  if (!images.length) return html

  const lastFigures = new Map<AnyNode, ReturnType<typeof $>>()

  images.each((_, image) => {
    const parent = $(image).parent()
    let block = parent

    while (block.parent().length && !block.parent().is('section'))
      block = block.parent()

    const figure = $('<figure></figure>').append($(image))
    const previous = lastFigures.get(block[0]) ?? block
    previous.after(figure)
    lastFigures.set(block[0], figure)

    if (parent.is('p') && !parent.text().trim() && !parent.children().length)
      parent.remove()
  })

  return $.html()
}

class OxaImporter extends OxaConverter {
  fromOxa(document: OxaDocument): OxaSource {
    this.validate(document)

    const title = this.richTextToHtml(document.title ?? [])
    const bodyMetadata = document.data?.[BODY_METADATA_KEY]

    const bodyMetadataHtml = isPlainObject(bodyMetadata)
      ? this.converters
          .map(converter =>
            converter.fromMetadata(
              bodyMetadata as Record<string, unknown>,
              this.renderInlines,
            ),
          )
          .join('')
      : ''

    const references = document.children.findIndex(
      child =>
        child.type === 'Section' && child.classes?.includes('references'),
    )

    const split = references === -1 ? document.children.length : references

    return {
      body: moveInlineImagesIntoFigures(
        [
          this.renderChildren(document, document.children.slice(0, split)),
          bodyMetadataHtml,
          this.renderChildren(document, document.children.slice(split)),
        ].join(''),
      ),
      ...(title ? { title } : {}),
      metadata: this.extractMetadata(document.data),
    }
  }

  private extractMetadata(
    data: Record<string, unknown> = {},
    prefix = '',
  ): OxaSourceMetadata[] {
    return Object.entries(data).flatMap<OxaSourceMetadata>(([key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key

      const html = this.richTextToHtml(value)
      if (html !== null) return [{ path, value: html, html: true }]

      if (isPlainObject(value))
        return this.extractMetadata(value as Record<string, unknown>, path)

      return [{ path, value }]
    })
  }

  private richTextToHtml(value: unknown): string | null {
    const nodes = (Array.isArray(value) ? value : [value]) as OxaNode[]
    if (!nodes.length) return null

    /**
     * The validator at the root level does not check if metadata is valid OXA
     * (anything is valid under Document.data), so we do it here - the
     * OXA->HTML converters assume valid OXA input.
     */

    if (nodes.every(node => this.validator('Block')(node)))
      return nodes.map(node => this.renderNode(node, null)).join('')

    if (nodes.every(node => this.validator('Inline')(node))) {
      return this.renderNode(
        { type: 'Paragraph', children: nodes as OxaInline[] },
        null,
      )
    }

    return null
  }

  private renderInlines: RenderInlines = value => {
    const validator = this.validator('Inline')

    return Array.isArray(value) &&
      value.every((node): node is OxaInline => Boolean(validator(node)))
      ? this.renderChildren({ type: 'Paragraph', children: value }, value)
      : ''
  }

  private renderChildren: RenderChildren = (
    parent,
    nodes = childrenOf(parent),
  ) => nodes.map(node => this.renderNode(node, parent)).join('')

  private renderNode(node: OxaNode, parent: OxaNode | null): string {
    const converter = this.converters.find(c => c.oxaTypes.includes(node.type))

    if (!converter) throw new Error(`No converter for OXA type ${node.type}`)

    const childList = childrenOf(node).map(child =>
      this.renderNode(child, node),
    )

    return converter.fromOxa(node, childList.join(''), {
      parent,
      childList,
      renderChildren: this.renderChildren,
    })
  }
}

export default OxaImporter

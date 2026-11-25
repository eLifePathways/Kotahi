import type { Element } from 'cheerio'

import {
  BlockConverter,
  InlineConverter,
  type ExportConverterOptions,
  type FromOxaContext,
} from '../OxaNodeConverter'
import { nodeSchema } from '../nodeSchema'
import type {
  OxaBlock,
  OxaInline,
  OxaImage,
  OxaInlineImage,
  OxaNode,
} from '../../oxa.types'

type ImageFields = { url: string; alt?: string; encodingFormat?: string }

const BLOCK_TAGS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'pre',
  'hr',
  'ul',
  'ol',
  'li',
  'table',
  'figure',
  'figcaption',
  'caption',
  'img',
  'blockquote',
  'math-display',
  'section',
])

const PHRASING_BLOCKS = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

const isInlineContext = (el: Element): boolean => {
  const { parent } = el
  if (!parent || !('attribs' in parent)) return false
  return PHRASING_BLOCKS.includes(parent.name) || !BLOCK_TAGS.has(parent.name)
}

const imageFields = (
  el: Element,
  { files, fileUrl }: ExportConverterOptions,
): ImageFields => {
  const fileId = el.attribs['data-fileid']
  const file = files.find(f => fileId && f.id === fileId)

  return {
    url: file ? fileUrl(file) : el.attribs.src,
    ...(el.attribs.alt ? { alt: el.attribs.alt } : {}),
    ...(file ? { encodingFormat: file.mimetype } : {}),
  }
}

// RFC: Images and Media (oxa-dev/rfc#6)
export class ImageConverter extends BlockConverter {
  readonly tier = 'rfc'
  readonly oxaTypes = ['Image']
  readonly schema = nodeSchema(
    'Image',
    {
      url: { type: 'string' },
      alt: { type: 'string' },
      encodingFormat: { type: 'string' },
    },
    ['url'],
  )
  protected readonly selectors = ['img']

  protected toOxa(el: Element): OxaBlock | null {
    const fields = imageFields(el, this.options as ExportConverterOptions)
    if (!fields.url) return null
    return { type: 'Image', ...fields }
  }

  protected fallback(el: Element): OxaBlock | null {
    const alt = el.attribs.alt?.trim()
    if (!alt) return null
    return { type: 'Paragraph', children: [{ type: 'Text', value: alt }] }
  }

  fromOxa(node: OxaNode, children: string, { parent }: FromOxaContext): string {
    const { url, alt } = node as OxaImage
    const image = this.renderElement('img', { src: url, alt })
    return parent?.type === 'Figure'
      ? image
      : this.renderElement('figure', {}, image)
  }
}

// RFC: Images and Media (oxa-dev/rfc#6)
export class InlineImageConverter extends InlineConverter {
  readonly tier = 'rfc'
  readonly oxaTypes = ['InlineImage']
  readonly schema = nodeSchema(
    'InlineImage',
    {
      url: { type: 'string' },
      alt: { type: 'string' },
      encodingFormat: { type: 'string' },
    },
    ['url'],
  )
  protected readonly selectors = ['img']

  matches(el: Element): boolean {
    return super.matches(el) && isInlineContext(el)
  }

  protected toOxa(el: Element): OxaInline | null {
    const fields = imageFields(el, this.options as ExportConverterOptions)
    if (!fields.url) return null
    return { type: 'InlineImage', ...fields }
  }

  protected fallback(el: Element): OxaInline | null {
    const alt = el.attribs.alt?.trim()
    if (!alt) return null
    return { type: 'Text', value: alt }
  }

  fromOxa(node: OxaNode): string {
    const { url, alt } = node as OxaInlineImage
    return this.renderElement('img', { src: url, alt })
  }
}

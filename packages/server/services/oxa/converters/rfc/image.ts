import type { Element } from 'cheerio'

import type Manuscript from '../../../../models/manuscript/manuscript.model'

import { BlockConverter, InlineConverter } from '../OxaNodeConverter'
import { nodeSchema } from '../nodeSchema'
import type { OxaBlock, OxaInline } from '../../oxa.types'

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

const imageFields = (el: Element, files: Manuscript['files']): ImageFields => {
  const fileId = el.attribs['data-fileid']

  const file = (files ?? []).find(f => fileId && f.id === fileId) as
    | { storedObjects?: { type: string; mimetype?: string }[] }
    | undefined

  const encodingFormat = file?.storedObjects?.find(
    o => o.type === 'original',
  )?.mimetype

  return {
    url: el.attribs.src,
    ...(el.attribs.alt ? { alt: el.attribs.alt } : {}),
    ...(encodingFormat ? { encodingFormat } : {}),
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
  readonly leaf = true
  protected readonly selectors = ['img']

  protected toOxa(el: Element): OxaBlock | null {
    if (!el.attribs.src) return null
    return { type: 'Image', ...imageFields(el, this.options.files) }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(el: Element): OxaBlock | null {
    const alt = el.attribs.alt?.trim()
    if (!alt) return null
    return { type: 'Paragraph', children: [{ type: 'Text', value: alt }] }
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
  readonly leaf = true
  protected readonly selectors = ['img']

  matches(el: Element): boolean {
    return super.matches(el) && isInlineContext(el)
  }

  protected toOxa(el: Element): OxaInline | null {
    if (!el.attribs.src) return null
    return { type: 'InlineImage', ...imageFields(el, this.options.files) }
  }

  // eslint-disable-next-line class-methods-use-this
  protected fallback(el: Element): OxaInline | null {
    const alt = el.attribs.alt?.trim()
    if (!alt) return null
    return { type: 'Text', value: alt }
  }
}

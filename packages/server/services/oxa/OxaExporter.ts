import { load, type AnyNode } from 'cheerio'
import set from 'lodash/set'

import {
  type ExportConverterOptions,
  normalizeInlineElements,
} from './converters/OxaNodeConverter'
import type { OxaBlock, OxaDocument, OxaInline, OxaNode } from './oxa.types'

import OxaConverter, {
  BODY_METADATA_KEY,
  type OxaConverterOptions,
  type OxaFileUrl,
  type OxaSource,
  type OxaSourceFile,
  type OxaSourceMetadata,
} from './OxaConverter'
import { ROOT_TAG } from './converters/standard/document'
import normalizeWhitespace from './whitespace'

export type OxaExporterOptions = OxaConverterOptions & { fileUrl: OxaFileUrl }

const parse = (html: string): AnyNode[] =>
  normalizeWhitespace(
    load(
      `<${ROOT_TAG}>${html}</${ROOT_TAG}>`,
      { xml: { xmlMode: false } },
      false,
    ).root()[0].children,
  )

class OxaExporter extends OxaConverter<ExportConverterOptions> {
  constructor(options: OxaExporterOptions) {
    super(options)
    this.options.fileUrl = options.fileUrl
    /**
     * Files are used for image conversions.
     */
    this.options.files = []
  }

  toOxa(source: OxaSource): OxaDocument {
    // Some converters hold state. Wipe it before running again.
    this.converters.forEach(converter => converter.reset())

    this.options.files = source.files ?? []

    const body = this.convertBlocks(source.body)

    // some converters (eg. footnotes) can append content to the end of the body
    const endBlocks = this.converters.flatMap(converter =>
      converter.collectEndBlocks(),
    )

    const document: OxaDocument = {
      type: 'Document',
      children: [...body, ...endBlocks],
    }

    const title = this.convertTitle(source.title)

    if (title) document.title = title

    const metadata = this.convertMetadata(source.metadata)

    /**
     * Some metadata fields come from the body of the docment and not the
     * submission form. We prefix them to avoid potential collisions with the
     * form fields. eg. we capture "funding" from the body, but a form field
     * named "funding" would collide with it.
     */
    const bodyMetadata = Object.assign(
      {},
      ...this.converters.map(converter => converter.metadata()),
    )

    if (Object.keys(bodyMetadata).length)
      metadata[BODY_METADATA_KEY] = bodyMetadata

    /**
     * There's an RFC for a metadata key on the document, but it does not define
     * any valid keys yet. It also says that all unknown keys should go under
     * data. All keys are unknown as it stands, so we put all under data.
     */
    if (Object.keys(metadata).length) document.data = metadata

    this.validate(document)

    return document
  }

  private convertBlocks(html: string | null | undefined): OxaBlock[] {
    if (!html) return []
    const [root] = this.convertNodes(parse(html))
    if (!root || !('children' in root)) return []
    return root.children as OxaBlock[]
  }

  private convertNodes(nodes: AnyNode[]): OxaNode[] {
    return nodes.flatMap(node => this.convertNode(node))
  }

  private convertNode(node: AnyNode): OxaNode[] {
    const converter = this.converters.find(c => c.matches(node))

    /**
     * If this node is not covered by a converter:
     * - if it is an HTML element (elements have `node.attribs`), unwrap it and
     *    move on to its children
     * - if it is not an HTML element (eg. a comment), ignore it
     */
    if (!converter)
      return 'attribs' in node ? this.convertNodes(node.children) : []

    const children =
      converter.skipChildren || !('children' in node)
        ? []
        : this.convertNodes(node.children)
    const result = converter.convertToOxa(node, children)

    if (!result) return []
    return Array.isArray(result) ? result : [result]
  }

  private convertMetadata(
    entries: OxaSourceMetadata[] = [],
  ): Record<string, unknown> {
    const metadata: Record<string, unknown> = {}

    entries.forEach(entry => {
      let value: unknown

      if ('files' in entry) {
        value = entry.files.map(file => this.convertFile(file))
      } else if (entry.html && typeof entry.value === 'string') {
        value = this.convertBlocks(entry.value)
      } else {
        value = entry.value
      }

      if (Array.isArray(value) && !value.length) return

      set(metadata, entry.path, value)
    })

    return metadata
  }

  private convertFile(file: OxaSourceFile): Record<string, string> {
    return {
      name: file.name,
      url: this.options.fileUrl(file),
      encodingFormat: file.mimetype,
    }
  }

  private convertTitle(html?: string): OxaInline[] | undefined {
    if (!html) return undefined

    const separator: OxaInline = { type: 'Text', value: ' ' }

    const title = normalizeInlineElements(
      this.convertBlocks(html)
        .filter(block => block.type === 'Paragraph' || block.type === 'Heading')
        .flatMap((block, index) => [
          ...(index ? [separator] : []),
          ...(block.children as OxaInline[]),
        ]),
    )

    return title.length ? title : undefined
  }
}

export default OxaExporter

import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import { load, type AnyNode } from 'cheerio'
import set from 'lodash/set'

import {
  type AnyConverter,
  type ConverterOptions,
  type RenderChildren,
  childrenOf,
  normalizeInlineElements,
} from './converters/OxaNodeConverter'
import type { OxaBlock, OxaDocument, OxaInline, OxaNode } from './oxa.types'

import createConverters from './converters'
import { ROOT_TAG } from './converters/standard/document'
import normalizeWhitespace from './whitespace'

export type OxaSourceFile = {
  id: string
  name: string
  mimetype: string
}

export type OxaFileUrl = (file: OxaSourceFile) => string

export type OxaConverterOptions = {
  enableRFC?: boolean
  enableExperimental?: boolean
  fileUrl: OxaFileUrl
}

export type OxaSourceMetadata =
  | { path: string; value: unknown; html?: boolean }
  | { path: string; files: OxaSourceFile[] }

export type OxaSource = {
  body?: string
  title?: string
  metadata?: OxaSourceMetadata[]
  files?: OxaSourceFile[]
}

const oxaSchema = require('./schemas/oxa-0.2.1.schema.json')

const validators = new Map<string, ValidateFunction>()

const BODY_METADATA_KEY = '_body'

const parse = (html: string): AnyNode[] =>
  normalizeWhitespace(
    load(
      `<${ROOT_TAG}>${html}</${ROOT_TAG}>`,
      { xml: { xmlMode: false } },
      false,
    ).root()[0].children,
  )

class OxaConverter {
  private readonly options: ConverterOptions
  private readonly converters: AnyConverter[]

  constructor(options: OxaConverterOptions) {
    this.options = {
      enableRFC: options.enableRFC ?? false,
      enableExperimental: options.enableExperimental ?? false,
      fileUrl: options.fileUrl,
      /**
       * Files are used for image conversions.
       */
      files: [],
      /**
       * Which block-type converters are available is dynamic and each
       * converter does not know about other converters. So we construct this
       * function here so that a converter can call it.
       */
      isBlock: (node): boolean =>
        this.converters.some(
          c => c.kind === 'block' && c.oxaTypes.includes(node.type),
        ),
    }

    this.converters = createConverters(this.options)
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

  fromOxa(document: OxaDocument): string {
    this.validate(document)
    return this.renderNode(document, null)
  }

  private validate(document: OxaDocument): void {
    /**
     * This will evaluate to something along the lines of "true:false".
     *
     * What we're doing here is caching the result of ajv.compile to the top of
     * the module so that it can be reused between instances of this class.
     * "true: false": compilation_result_for_true_false
     * "false: false": compilation_result_for_false_false
     * etc.
     *
     * ajv.compile is theoretically expensive.
     * On a single document, the difference would be negligible.
     * If bulk converting documents, the performance cost could add up.
     */
    const key = `${this.options.enableRFC}:${this.options.enableExperimental}`

    if (!validators.has(key)) {
      const ajv = new Ajv({ allErrors: true, strict: true })
      ajv.addKeyword('version')
      addFormats(ajv)
      validators.set(key, ajv.compile(this.buildSchema()))
    }

    const validator = validators.get(key)
    if (validator(document)) return

    const errors = (validator.errors ?? [])
      .map(error => `${error.instancePath || '/'}: ${error.message}`)
      .join('; ')

    throw new Error(`Invalid OXA document: ${errors}`)
  }

  private buildSchema(): typeof oxaSchema {
    const schema = structuredClone(oxaSchema)

    this.converters
      .filter(converter => converter.tier !== 'standard' && converter.enabled)
      .forEach(({ kind, schema: nodeSchema }) => {
        if (!nodeSchema) return
        const union = kind === 'block' ? 'Block' : 'Inline'
        schema.definitions[nodeSchema.title] = nodeSchema
        schema.definitions[union].anyOf.push({
          $ref: `#/definitions/${nodeSchema.title}`,
        })
      })

    return schema
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

export default OxaConverter

import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'
import { load, type AnyNode } from 'cheerio'

import type Manuscript from '../../models/manuscript/manuscript.model'
import {
  type AnyConverter,
  type ConverterOptions,
  normalizeInlineElements,
} from './converters/OxaNodeConverter'
import type { OxaBlock, OxaDocument, OxaInline, OxaNode } from './oxa.types'

import createConverters from './converters'
import { ROOT_TAG } from './converters/standard/document'
import buildMetadata from './metadata'
import normalizeWhitespace from './whitespace'

export type OxaConverterOptions = {
  enableRFC?: boolean
  enableExperimental?: boolean
}

const oxaSchema = require('./schemas/oxa-0.2.1.schema.json')

const validators = new Map<string, ValidateFunction>()

const parse = (html: string): AnyNode[] =>
  normalizeWhitespace(
    load(
      `<${ROOT_TAG}>${html}</${ROOT_TAG}>`,
      { xml: { xmlMode: false } },
      false,
    ).root()[0].children,
  )

class OxaConverter {
  private readonly manuscript: Manuscript
  private readonly options: ConverterOptions
  private readonly converters: AnyConverter[]

  constructor(manuscript: Manuscript, options: OxaConverterOptions = {}) {
    this.manuscript = manuscript

    this.options = {
      enableRFC: options.enableRFC ?? false,
      enableExperimental: options.enableExperimental ?? false,
      /**
       * Files are used for image conversions.
       */
      files: manuscript.files ?? [],
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

  convert(): OxaDocument {
    // Some converters hold state. Wipe it before running again.
    this.converters.forEach(converter => converter.reset())

    const body = this.convertBlocks(this.manuscript.meta?.source)

    // some converters (eg. footnotes) can append content to the end of the body
    const endBlocks = this.converters.flatMap(converter =>
      converter.collectEndBlocks(),
    )

    const document: OxaDocument = {
      type: 'Document',
      children: [...body, ...endBlocks],
    }

    const title = this.convertTitle()
    if (title) document.title = title

    const abstract = this.options.enableExperimental
      ? this.convertBlocks(
          this.manuscript.submission?.$abstract ||
            this.manuscript.meta?.abstract,
        )
      : []

    const metadata = Object.assign(
      buildMetadata(this.manuscript, this.options, abstract),
      ...this.converters.map(converter => converter.metadata()),
    )

    if (Object.keys(metadata).length) document.metadata = metadata

    this.validate(document)

    return document
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
      converter.leaf || !('children' in node)
        ? []
        : this.convertNodes(node.children)
    const result = converter.convert(node, children)

    if (!result) return []
    return Array.isArray(result) ? result : [result]
  }

  private convertTitle(): OxaInline[] | undefined {
    const html =
      this.manuscript.submission?.$title || this.manuscript.meta?.title

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

export default OxaConverter

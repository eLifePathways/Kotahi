import Ajv, { type ValidateFunction } from 'ajv'
import addFormats from 'ajv-formats'

import {
  type AnyConverter,
  type ConverterOptions,
} from './converters/OxaNodeConverter'
import type { OxaDocument } from './oxa.types'

import createConverters from './converters'

export type OxaSourceFile = {
  id: string
  name: string
  mimetype: string
}

export type OxaFileUrl = (file: OxaSourceFile) => string

export type OxaConverterOptions = {
  enableRFC?: boolean
  enableExperimental?: boolean
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

type OxaDefinition = 'Document' | 'Block' | 'Inline'

const validators = new Map<string, Record<OxaDefinition, ValidateFunction>>()

export const BODY_METADATA_KEY = '_body'

abstract class OxaConverter<
  Options extends ConverterOptions = ConverterOptions,
> {
  protected readonly options: Options
  protected readonly converters: AnyConverter[]

  constructor(options: OxaConverterOptions) {
    this.options = {
      enableRFC: options.enableRFC ?? true,
      enableExperimental: options.enableExperimental ?? true,
      /**
       * Which block-type converters are available is dynamic and each
       * converter does not know about other converters. So we construct this
       * function here so that a converter can call it.
       */
      isBlock: (node): boolean =>
        this.converters.some(
          c => c.kind === 'block' && c.oxaTypes.includes(node.type),
        ),
    } as Options

    this.converters = createConverters(this.options)
  }

  protected validator(definition: OxaDefinition): ValidateFunction {
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

      const schema = this.buildSchema()
      ajv.addSchema(schema)

      const compile = (name: OxaDefinition): ValidateFunction =>
        ajv.getSchema(`${schema.$id}#/definitions/${name}`)

      validators.set(key, {
        Document: compile('Document'),
        Block: compile('Block'),
        Inline: compile('Inline'),
      })
    }

    return validators.get(key)[definition]
  }

  protected validate(document: OxaDocument): void {
    const validator = this.validator('Document')
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
}

export default OxaConverter

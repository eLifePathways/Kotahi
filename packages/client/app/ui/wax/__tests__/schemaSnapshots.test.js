import { describe, expect, it, vi } from 'vitest'
import { DOMSerializer } from 'prosemirror-model'

import Application from '../wax-prosemirror-core/src/Application'

import fullWaxEditorConfig from '../wax-collab/config/FullWaxEditorConfig'
import simpleWaxEditorConfig from '../wax-collab/config/SimpleWaxEditorConfig'
import productionWaxEditorConfig from '../wax-collab/config/ProductionWaxEditorConfig'
import authorProofingWaxEditorConfig from '../wax-collab/config/AuthorProofingWaxEditorConfig'
import chatWaxEditorConfig from '../chat-editor/ChatWaxEditorConfig'
import contentEditorConfig from '../cms-editor/config/ContentEditorConfig'
import createHandlebarsState from '../handlebars-autocomplete/config'

vi.mock('@coko/client', async importOriginal => ({
  ...(await importOriginal()),
  uuid: () => '<uuid>',
}))

const noop = () => {}
const noComments = () => []

const editors = {
  full: () => fullWaxEditorConfig(noop, noop, noComments, false, {}),
  simple: () => simpleWaxEditorConfig(),
  'simple-handlebars': () =>
    simpleWaxEditorConfig({
      autocompleteConfig: createHandlebarsState({}).autocompleteConfig,
    }),
  production: () =>
    productionWaxEditorConfig(
      noop,
      noop,
      noop,
      noop,
      noop,
      noComments,
      noop,
      false,
      false,
      {},
    ),
  'author-proofing': () =>
    authorProofingWaxEditorConfig(noop, noop, noop, noop, noop, noComments),
  chat: () => chatWaxEditorConfig({ onEnterPress: noop }),
  cms: () => contentEditorConfig(noop),
}

const REQUIRED = '<required>'

const describeValue = value => {
  if (typeof value === 'function') return '[function]'
  if (Array.isArray(value)) return value.map(describeValue)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, describeValue(v)]),
    )
  }

  return value
}

const describeAttrs = attrs =>
  Object.fromEntries(
    Object.entries(attrs || {}).map(([name, spec]) => [
      name,
      spec && 'default' in spec ? describeValue(spec.default) : REQUIRED,
    ]),
  )

const sampleAttrs = attrs =>
  Object.fromEntries(
    Object.entries(attrs || {}).map(([name, spec]) => [
      name,
      spec && 'default' in spec ? spec.default : REQUIRED,
    ]),
  )

const renderToDOM = render => {
  try {
    const { dom } = DOMSerializer.renderSpec(document, render())
    return dom.outerHTML ?? dom.textContent
  } catch (e) {
    return `[toDOM threw: ${e.message}]`
  }
}

const describeSpec = (spec, renderedToDOM) => {
  const out = {}

  Object.keys(spec).forEach(key => {
    if (key === 'toDOM') out.toDOM = renderedToDOM
    else if (key === 'attrs') out.attrs = describeAttrs(spec.attrs)
    else out[key] = describeValue(spec[key])
  })

  return out
}

const describeSchema = schema => {
  const nodes = []
  const marks = []

  schema.spec.nodes.forEach((name, spec) => {
    const type = schema.nodes[name]

    const rendered = spec.toDOM
      ? renderToDOM(() => spec.toDOM(type.create(sampleAttrs(spec.attrs))))
      : undefined

    nodes.push({ name, ...describeSpec(spec, rendered) })
  })

  schema.spec.marks.forEach((name, spec) => {
    const type = schema.marks[name]

    const rendered = spec.toDOM
      ? renderToDOM(() =>
          spec.toDOM(type.create(sampleAttrs(spec.attrs)), true),
        )
      : undefined

    marks.push({ name, ...describeSpec(spec, rendered) })
  })

  return { topNode: schema.topNodeType.name, nodes, marks }
}

describe('wax editor schemas', () => {
  Object.entries(editors).forEach(([name, createConfig]) => {
    it(`${name} editor schema is unchanged`, async () => {
      const app = Application.create({ config: createConfig() })
      const schema = app.getSchema()

      await expect(
        `${JSON.stringify(describeSchema(schema), null, 2)}\n`,
      ).toMatchFileSnapshot(`./__snapshots__/schema-${name}.json`)
    })
  })
})

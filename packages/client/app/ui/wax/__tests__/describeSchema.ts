import {
  DOMSerializer,
  type AttributeSpec,
  type DOMOutputSpec,
  type MarkSpec,
  type NodeSpec,
  type Schema,
} from 'prosemirror-model'

type Described = Record<string, unknown>

type SchemaDescription = {
  topNode: string
  nodes: Described[]
  marks: Described[]
}

const REQUIRED = '<required>'

const describeValue = (value: unknown): unknown => {
  if (typeof value === 'function') return '[function]'
  if (Array.isArray(value)) return value.map(describeValue)

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, describeValue(v)]),
    )
  }

  return value
}

const describeAttrs = (
  attrs: Record<string, AttributeSpec> | undefined,
): Described =>
  Object.fromEntries(
    Object.entries(attrs || {}).map(([name, spec]) => [
      name,
      spec && 'default' in spec ? describeValue(spec.default) : REQUIRED,
    ]),
  )

const sampleAttrs = (
  attrs: Record<string, AttributeSpec> | undefined,
): Described =>
  Object.fromEntries(
    Object.entries(attrs || {}).map(([name, spec]) => [
      name,
      spec && 'default' in spec ? spec.default : REQUIRED,
    ]),
  )

const renderToDOM = (render: () => DOMOutputSpec): string => {
  try {
    const { dom } = DOMSerializer.renderSpec(document, render())
    return (dom as HTMLElement).outerHTML ?? dom.textContent
  } catch (e) {
    return `[toDOM threw: ${e.message}]`
  }
}

const describeSpec = (
  spec: NodeSpec | MarkSpec,
  renderedToDOM: string | undefined,
): Described => {
  const out: Described = {}

  Object.keys(spec).forEach(key => {
    if (key === 'toDOM') out.toDOM = renderedToDOM
    else if (key === 'attrs') out.attrs = describeAttrs(spec.attrs)
    else out[key] = describeValue(spec[key])
  })

  return out
}

const describeSchema = (schema: Schema): SchemaDescription => {
  const nodes: Described[] = []
  const marks: Described[] = []

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

export default describeSchema

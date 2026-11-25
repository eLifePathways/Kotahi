import {
  DOMParser,
  DOMSerializer,
  type DOMOutputSpec,
  type Fragment,
  type Node,
  type Schema,
} from 'prosemirror-model'

export const parse = (schema: Schema, html: string): Node => {
  const container = document.createElement('article')
  container.innerHTML = html
  return DOMParser.fromSchema(schema).parse(container, {
    preserveWhitespace: true,
  })
}

const isNote = (schema: Schema, name: string): boolean =>
  (schema.nodes[name].spec.group ?? '').split(' ').includes('notes')

export const serialize = (schema: Schema, content: Fragment): string => {
  const nodes = DOMSerializer.nodesFromSchema(schema)

  Object.keys(nodes)
    .filter(name => isNote(schema, name))
    .forEach(name => {
      nodes[name] = (node: Node): DOMOutputSpec => [name, node.attrs, 0]
    })

  const container = document.createElement('article')
  container.appendChild(
    new DOMSerializer(
      nodes,
      DOMSerializer.marksFromSchema(schema),
    ).serializeFragment(content),
  )
  return container.innerHTML
}

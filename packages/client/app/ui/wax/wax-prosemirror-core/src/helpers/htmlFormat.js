import { DOMParser, DOMSerializer } from 'prosemirror-model'

export const parser = schema => {
  const WaxParser = DOMParser.fromSchema(schema)

  return content => {
    const container = document.createElement('article')

    container.innerHTML = content
    return WaxParser.parse(container, {
      preserveWhitespace: true,
    })
  }
}

export const serializer = schema => {
  const WaxSerializer = DOMSerializer.fromSchema(schema)
  return content => {
    const container = document.createElement('article')
    container.appendChild(WaxSerializer.serializeFragment(content))
    return container.innerHTML
  }
}

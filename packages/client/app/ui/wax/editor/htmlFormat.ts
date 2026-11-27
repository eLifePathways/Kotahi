import {
  DOMParser,
  DOMSerializer,
  type Fragment,
  type Node,
  type Schema,
} from 'prosemirror-model'

// HTML -> prosemirror
export const parse = (schema: Schema, html: string): Node => {
  /**
   * A little bit of security here against XSS:
   * Parse in a separate, inert document instead of setting innerHTML on an
   * element of the page's document. Elements created by the page's document
   * load resources and run inline handlers even when detached, so HTML like
   * <img src=x onerror="..."> would run code as soon as it's parsed. A document
   * from parseFromString never loads or runs anything.
   *
   * window.DOMParser is the browser's parser, not prosemirror's DOMParser.
   */
  const { body } = new window.DOMParser().parseFromString(html, 'text/html')

  return DOMParser.fromSchema(schema).parse(body, {
    preserveWhitespace: true,
  })
}

// prosemirror -> HTML
export const serialize = (schema: Schema, content: Fragment): string => {
  /**
   * Output from the serialiser doesn't need protecting, because HTML that
   * ProseMirror produces only contains what the schema allows.
   */
  const container = document.createElement('article')
  container.appendChild(
    DOMSerializer.fromSchema(schema).serializeFragment(content),
  )
  return container.innerHTML
}

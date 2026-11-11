import type { AnyNode } from 'cheerio'

type TextNode = AnyNode & { data: string }

type LineState = { dropLeadingSpace: boolean; lastTextNode: TextNode | null }

const BLOCKS = new Set([
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
  'thead',
  'tbody',
  'tfoot',
  'tr',
  'td',
  'th',
  'caption',
  'figure',
  'figcaption',
  'blockquote',
  'math-display',
  'section',
])

const PRESERVED = new Set(['pre', 'code', 'math-display', 'math-inline'])
const IGNORED = new Set(['script', 'style'])
const ATOMS = new Set(['img'])
const ISOLATED = new Set(['footnote'])

const endLine = (lineState: LineState): void => {
  // drop whitespace at the end of the line
  if (lineState.lastTextNode) {
    lineState.lastTextNode.data = lineState.lastTextNode.data.trimEnd()
  }

  // reset values for next line
  lineState.dropLeadingSpace = true
  lineState.lastTextNode = null
}

/**
 * Inline elements that are content themselves (eg. img, inline code) don't
 * cause adjacent spaces to be removed.
 */
const markNonTextContent = (lineState: LineState): void => {
  lineState.lastTextNode = null
  lineState.dropLeadingSpace = false
}

const normalizeText = (node: TextNode, lineState: LineState): void => {
  // replace each run of whitespace (eg. tab, newline, nbsp) with a single space
  const collapsed = node.data.replace(/\s+/g, ' ')
  node.data = lineState.dropLeadingSpace ? collapsed.trimStart() : collapsed

  // if a text node ends up empty, do not replace last text node
  if (!node.data) return

  lineState.dropLeadingSpace = node.data.endsWith(' ')
  lineState.lastTextNode = node
}

const normalizeContext = (nodes: AnyNode[]): void => {
  /**
   * Line here is an unbroken run of inline content.
   * Lines end when they encounter block elements or br elements.
   *
   * `dropLeadingSpace`: whether the next text node should trim space at the start
   * `lastTextNode`: the last text node encountered in this line
   *                  (eg. in <em>b</em> the last text node is "b")
   *
   * The last text node is only tracked so that we can drop the whitespace at
   * the end of a line.
   */
  const lineState: LineState = { dropLeadingSpace: true, lastTextNode: null }

  const visit = (children: AnyNode[]): void =>
    children.forEach(node => {
      if (String(node.type) === 'text') {
        normalizeText(node as TextNode, lineState)
        return
      }

      if (!('attribs' in node) || IGNORED.has(node.name)) return

      // do not touch whitespace in content of preserved nodes (eg. code, math)
      if (PRESERVED.has(node.name)) {
        if (BLOCKS.has(node.name)) {
          endLine(lineState)
        } else {
          markNonTextContent(lineState)
        }
      } else if (BLOCKS.has(node.name)) {
        endLine(lineState)
        normalizeContext(node.children)
      } else if (node.name === 'br') {
        endLine(lineState)
      } else if (ISOLATED.has(node.name)) {
        normalizeContext(node.children)
        markNonTextContent(lineState)
      } else if (ATOMS.has(node.name)) {
        markNonTextContent(lineState)
      } else {
        visit(node.children)
      }
    })

  visit(nodes)
  endLine(lineState)
}

/**
 * Nodes here is an array of cheerio nodes.
 */
const normalizeWhitespace = (nodes: AnyNode[]): AnyNode[] => {
  normalizeContext(nodes)
  return nodes
}

export default normalizeWhitespace

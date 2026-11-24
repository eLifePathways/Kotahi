import type { NodeSpec } from 'prosemirror-model'

import type { WaxFeature } from './types'

const nodes: Record<string, NodeSpec> = {
  doc: {
    content: 'block+',
  },
  text: {
    group: 'inline',
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: () => ['br'],
  },
  paragraph: {
    group: 'block',
    content: 'inline*',
    attrs: {
      class: { default: 'paragraph' },
    },
    parseDOM: [
      {
        tag: 'p.paragraph',
        getAttrs: (dom: HTMLElement) => ({ class: dom.getAttribute('class') }),
      },
    ],
    toDOM: node => ['p', node.attrs, 0],
  },
}

const base: WaxFeature = {
  name: 'base',
  nodes,
  marks: {},
}

export default base

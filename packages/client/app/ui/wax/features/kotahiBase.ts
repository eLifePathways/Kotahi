import type { Attrs, NodeSpec } from 'prosemirror-model'

import base from './base'
import { parseTracks } from './helpers'
import type { WaxFeature } from './types'

const blockLevelToDOM = (attrs: Attrs): Attrs =>
  attrs.track && attrs.track.length
    ? {
        'data-id': attrs.id,
        class: attrs.class,
        'data-track': JSON.stringify(attrs.track),
        'data-group': attrs.group,
        'data-viewid': attrs.viewid,
      }
    : { class: attrs.class }

const paragraph: NodeSpec = {
  group: 'block',
  content: 'inline*',
  attrs: {
    id: { default: '' },
    class: { default: 'paragraph' },
    track: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag: 'p.paragraph',
      getAttrs: (dom: HTMLElement) => ({
        id: dom.dataset.id,
        class: dom.getAttribute('class'),
        track: parseTracks(dom.dataset.track),
        group: dom.dataset.group,
        viewid: dom.dataset.viewid,
      }),
    },
  ],
  toDOM: node => ['p', blockLevelToDOM(node.attrs), 0],
}

const kotahiBase: WaxFeature = {
  name: 'kotahiBase',
  nodes: { ...base.nodes, paragraph },
  marks: {},
}

export default kotahiBase

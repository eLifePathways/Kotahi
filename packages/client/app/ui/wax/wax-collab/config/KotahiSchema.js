import { EditoriaSchema /* SchemaHelpers */ } from '../../wax-prosemirror-core'

const KotahiSchema = {
  marks: { ...EditoriaSchema.marks },
  nodes: {
    ...EditoriaSchema.nodes,
    // title: {
    //   group: 'block',
    //   content: 'inline*',
    //   defining: true,
    //   attrs: {
    //     level: { default: 1 },
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },
    //   parseDOM: [
    //     {
    //       tag: 'h1',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h1', attrs, 0]
    //   },
    // },
    // heading2: {
    //   content: 'inline*',
    //   group: 'block',
    //   defining: true,
    //   attrs: {
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },

    //   parseDOM: [
    //     {
    //       tag: 'h2',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h2', attrs, 0]
    //   },
    // },
    // heading3: {
    //   content: 'inline*',
    //   group: 'block',
    //   defining: true,
    //   attrs: {
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },

    //   parseDOM: [
    //     {
    //       tag: 'h3',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h3', attrs, 0]
    //   },
    // },
    // heading4: {
    //   content: 'inline*',
    //   group: 'block',
    //   defining: true,
    //   attrs: {
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },

    //   parseDOM: [
    //     {
    //       tag: 'h4',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h4', attrs, 0]
    //   },
    // },
    // heading5: {
    //   content: 'inline*',
    //   group: 'block',
    //   defining: true,
    //   attrs: {
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },

    //   parseDOM: [
    //     {
    //       tag: 'h5',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h5', attrs, 0]
    //   },
    // },
    // heading6: {
    //   content: 'inline*',
    //   group: 'block',
    //   defining: true,
    //   attrs: {
    //     id: { default: '' },
    //     class: { default: '' },
    //     track: { default: [] },
    //     group: { default: '' },
    //     viewid: { default: '' },
    //   },

    //   parseDOM: [
    //     {
    //       tag: 'h6',
    //       getAttrs(dom) {
    //         return {
    //           id: dom.dataset.id,
    //           class: dom.getAttribute('class'),
    //           track: SchemaHelpers.parseTracks(dom.dataset.track),
    //           group: dom.dataset.group,
    //           viewid: dom.dataset.viewid,
    //           level: dom.dataset.level,
    //         }
    //       },
    //     },
    //   ],
    //   toDOM(node) {
    //     const attrs = SchemaHelpers.blockLevelToDOM(node)
    //     return ['h6', attrs, 0]
    //   },
    // },
  },
}

// console.log(KotahiSchema)

export default KotahiSchema

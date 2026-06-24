import { SchemaHelpers } from 'wax-prosemirror-core'

const orderedListNode = {
  group: 'block',
  content: 'list_item+',
  attrs: {
    order: { default: 1 },
    track: { default: [] },
    id: { default: '' },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag: 'ol',
      getAttrs(hook, next) {
        Object.assign(hook, {
          id: hook.dom.dataset.id,
          track: SchemaHelpers.parseTracks(hook.dom.dataset.track),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
          order: hook.dom.hasAttribute('start')
            ? +hook.dom.getAttribute('start')
            : 1,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {}

    if (hook.node.attrs.order !== 1) {
      attrs.start = hook.node.attrs.order
    }

    if (hook.node.attrs.track && hook.node.attrs.track.length) {
      attrs['data-id'] = hook.node.attrs.id
      attrs['data-track'] = JSON.stringify(hook.node.attrs.track)
      attrs['data-group'] = hook.node.attrs.group
      attrs['data-viewid'] = hook.node.attrs.viewid
    }

    hook.value = ['ol', attrs, 0]
    next()
  },
}

export default orderedListNode

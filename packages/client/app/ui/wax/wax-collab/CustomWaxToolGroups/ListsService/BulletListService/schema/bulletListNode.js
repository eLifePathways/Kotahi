import { SchemaHelpers } from '../../../../../wax-prosemirror-core'

const bulletListNode = {
  group: 'block',
  content: 'list_item+',
  attrs: {
    id: { default: '' },
    track: { default: [] },
    group: { default: '' },
    viewid: { default: '' },
  },
  parseDOM: [
    {
      tag: 'ul',
      getAttrs(hook, next) {
        Object.assign(hook, {
          id: hook.dom.dataset.id,
          track: SchemaHelpers.parseTracks(hook.dom.dataset.track),
          group: hook.dom.dataset.group,
          viewid: hook.dom.dataset.viewid,
        })
        next()
      },
    },
  ],
  toDOM(hook, next) {
    const attrs = {}

    if (hook.node.attrs.track && hook.node.attrs.track.length) {
      attrs['data-id'] = hook.node.attrs.id
      attrs['data-track'] = JSON.stringify(hook.node.attrs.track)
      attrs['data-group'] = hook.node.attrs.group
      attrs['data-viewid'] = hook.node.attrs.viewid
    }

    hook.value = ['ul', attrs, 0]
    next()
  },
}

export default bulletListNode

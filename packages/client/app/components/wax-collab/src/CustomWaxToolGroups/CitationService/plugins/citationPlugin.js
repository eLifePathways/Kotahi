import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

// this is a copy of the Anystyle plugin!
// maybe: this could store values or pass values?

export default (key, config) =>
  new Plugin({
    key: new PluginKey(key),
    state: {
      init: function init() {
        // console.log('plugin init', config)
        return DecorationSet.empty
      },
      apply: function apply(tr, set) {
        // console.log('plugin apply')
        // Adjust decoration positions to changes made by the transaction
        set = set.map(tr.mapping, tr.doc)
        // See if the transaction adds or removes any placeholders
        const action = tr.getMeta(this)

        if (action && action.add) {
          // console.log('placeholder being added!')
          const widget = document.createElement('placeholder-citation')

          const deco = Decoration.widget(action.add.pos, widget, {
            id: action.add.id,
          })

          // const deco = Decoration.inline(action.add.posFrom, action.add.posTo, {
          //   class: 'any-style',
          // });
          set = set.add(tr.doc, [deco])
        } else if (action && action.remove) {
          set = set.remove(
            set.find(null, null, spec => spec.id === action.remove.id),
          )
        }

        return set
      },
    },
    props: {
      config,
      /* eslint-disable-next-line no-unused-vars */
      decorations: function decorations(state) {
        // return this.getState(state)
      },
    },
  })

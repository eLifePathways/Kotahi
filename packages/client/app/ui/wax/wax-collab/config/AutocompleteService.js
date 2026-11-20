import autocomplete from 'prosemirror-autocomplete'
import { Service } from '../../wax-prosemirror-core'

class AutocompleteService extends Service {
  name = 'AutocompleteService'

  boot() {
    const config = this.app.config.get('config.AutocompleteService')
    const { reducer, triggers } = config

    const options = {
      reducer,
      triggers,
    }

    const plugins = autocomplete(options)

    plugins.forEach((plugin, i) => {
      this.app.PmPlugins.add(`autocomplete-${i}`, plugin)
    })
  }

  register() {
    const createMark = this.container.get('CreateMark')
    const config = this.app.config.get('config.AutocompleteService')
    const { markName, className } = config

    createMark({
      [markName]: {
        attrs: {
          class: { default: className },
        },
        inclusive: false,
        parseDOM: [
          {
            tag: `span.${className}`,
            getAttrs(dom) {
              return {
                class: dom.getAttribute('class'),
              }
            },
          },
        ],
        toDOM(node) {
          return ['span', node.attrs, 0]
        },
      },
    })
  }
}
export default AutocompleteService

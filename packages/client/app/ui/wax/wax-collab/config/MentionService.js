import autocomplete from 'prosemirror-autocomplete'
import { Service } from '../../wax-prosemirror-core'

class MentionService extends Service {
  name = 'MentionService'

  boot() {
    const mentionsConfig = this.app.config.get('config.MentionService')

    const options = {
      reducer: mentionsConfig.autoCompleteReducer,
      triggers: [
        {
          name: 'mention',
          trigger: /(@)$/,
          decorationAttrs: { class: 'mention-tag' },
        },
      ],
    }

    const autoCompletePlugins = autocomplete(options)

    autoCompletePlugins.forEach((plugin, i) => {
      this.app.PmPlugins.add(`autocomplete-${i}`, plugin)
    })
  }

  register() {
    const createMark = this.container.get('CreateMark')

    createMark({
      mention_tag: {
        attrs: {
          class: { default: 'mention-tag' },
          id: { default: '' },
        },
        inclusive: false,
        parseDOM: [
          {
            tag: 'span.mention-tag',
            getAttrs(dom) {
              return {
                class: dom.getAttribute('class'),
                id: dom.getAttribute('id'),
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
export default MentionService

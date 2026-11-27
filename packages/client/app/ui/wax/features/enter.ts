import {
  DOMParser,
  DOMSerializer,
  type Fragment,
  type Node,
  type Schema,
} from 'prosemirror-model'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'

import type { WaxFeature } from '../editor'

type EnterOptions = {
  getContentOnEnter: (html: string) => void
}

const serializer =
  (schema: Schema) =>
  (content: Fragment): string => {
    const container = document.createElement('article')
    container.appendChild(
      DOMSerializer.fromSchema(schema).serializeFragment(content),
    )
    return container.innerHTML
  }

const parser =
  (schema: Schema) =>
  (content: string): Node => {
    const container = document.createElement('article')
    container.innerHTML = content
    return DOMParser.fromSchema(schema).parse(container)
  }

const getContentOnEnterKey = new PluginKey('getContentOnEnterPlugin')

const getContentOnEnterPlugin = ({ getContentOnEnter }: EnterOptions): Plugin =>
  new Plugin({
    key: getContentOnEnterKey,
    state: {
      init: (): void => {},
      apply(): void {},
    },
    props: {
      handleKeyDown(view, event): boolean {
        if (event.key !== 'Enter' || event.shiftKey) return false
        if (view.state.doc.content.size <= 2) return true

        const {
          selection: { from, to },
          schema,
          plugins,
          doc: { content },
        } = view.state

        let isList = false

        view.state.doc.nodesBetween(from, to, node => {
          if (node.type.name === 'list_item') isList = true
        })

        if (isList) return false

        getContentOnEnter(serializer(schema)(content))

        view.updateState(
          EditorState.create({ doc: parser(schema)(''), schema, plugins }),
        )

        if (view.dispatch) {
          view.dispatch(view.state.tr.setMeta('addToHistory', false))
        }

        return true
      },
    },
  })

const enter = (options: EnterOptions): WaxFeature => ({
  name: 'enter',
  plugins: () => ({
    getContentOnEnterPlugin: getContentOnEnterPlugin(options),
  }),
})

export default enter

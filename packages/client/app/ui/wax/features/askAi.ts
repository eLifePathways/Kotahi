import { DOMParser } from 'prosemirror-model'
import {
  Plugin,
  PluginKey,
  TextSelection,
  type Command,
} from 'prosemirror-state'
import { Decoration, DecorationSet, type EditorView } from 'prosemirror-view'

import type { WaxFeature } from './types'

type AiSelection = { from: number; to: number } | null

export const askAiKey = new PluginKey<AiSelection>('askAiSelectionPlugin')

export const setAiSelection =
  (range: AiSelection): Command =>
  (state, dispatch) => {
    if (dispatch) dispatch(state.tr.setMeta(askAiKey, range))
    return true
  }

const askAiSelectionPlugin = (): Plugin<AiSelection> =>
  new Plugin<AiSelection>({
    key: askAiKey,
    state: {
      init: (): AiSelection => null,
      apply(tr, value): AiSelection {
        const meta = tr.getMeta(askAiKey) as AiSelection | undefined
        const next = meta !== undefined ? meta : value
        if (!next || !tr.docChanged) return next
        return { from: tr.mapping.map(next.from), to: tr.mapping.map(next.to) }
      },
    },
    props: {
      decorations(state): DecorationSet {
        const range = askAiKey.getState(state)
        if (!range || range.from >= range.to) return DecorationSet.empty

        return DecorationSet.create(state.doc, [
          Decoration.inline(range.from, range.to, {
            class: 'ask-ai-selection',
          }),
        ])
      },
    },
  })

const elementFromString = (string: string): HTMLElement => {
  const wrappedValue = `<body>${string}</body>`
  const doc = new window.DOMParser().parseFromString(wrappedValue, 'text/html')
  return doc.body
}

export const replaceSelectedText = (
  view: EditorView,
  htmlString: string,
  replace = false,
): void => {
  if (!htmlString) return
  const { state } = view
  const { tr } = state
  const { from, to } = tr.selection

  const parser = DOMParser.fromSchema(state.schema)
  const parsedContent = parser.parse(elementFromString(htmlString))

  if (replace && from !== to) tr.delete(from, to).insert(from, parsedContent)
  else tr.insert(to, parsedContent)

  view.dispatch(tr)

  try {
    const currentState = view.state
    const newFrom = replace ? from : to
    const newTo = newFrom + parsedContent.content.size

    const docSize = currentState.doc.content.size
    const safeNewTo = Math.min(newTo, docSize)

    const newStateTr = currentState.tr.setSelection(
      TextSelection.create(currentState.doc, safeNewTo, safeNewTo),
    )

    view.dispatch(newStateTr)
    view.focus()
  } catch (error) {
    console.error('Failed to update selection:', error)
  }
}

const askAi: WaxFeature = {
  name: 'askAi',
  plugins: () => ({ askAiSelectionPlugin: askAiSelectionPlugin() }),
}

export default askAi

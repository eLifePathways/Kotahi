import {
  Plugin,
  PluginKey,
  TextSelection,
  type Command,
  type EditorState,
} from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

import { findMatches } from './helpers'
import type { WaxFeature } from '../editor'

type Match = { from: number; to: number }

type SearchState = {
  createdDecorations: DecorationSet
  allMatches: Match[]
}

export const findAndReplaceKey = new PluginKey<SearchState>(
  'findAndReplacePlugin',
)

let searchText = ''
let matchCase = false

export const setSearchText = (text: string): void => {
  searchText = text
}

export const setSearchMatchCase = (value: boolean): void => {
  matchCase = value
}

export const getMatches = (state: EditorState): Match[] =>
  findAndReplaceKey.getState(state)?.allMatches ?? []

export const selectMatch =
  (index: number): Command =>
  (state, dispatch) => {
    const match = getMatches(state)[index]
    if (!match) return false
    if (dispatch)
      dispatch(
        state.tr
          .setSelection(TextSelection.create(state.doc, match.from, match.to))
          .scrollIntoView(),
      )
    return true
  }

export const replaceMatch =
  (index: number, text: string): Command =>
  (state, dispatch) => {
    const match = getMatches(state)[index]
    if (!match) return false
    if (dispatch) dispatch(state.tr.insertText(text, match.from, match.to))
    return true
  }

export const replaceAll =
  (text: string): Command =>
  (state, dispatch) => {
    const matches = getMatches(state)
    if (!matches.length) return false

    if (dispatch) {
      const { tr } = state
      ;[...matches]
        .reverse()
        .forEach(({ from, to }) => tr.insertText(text, from, to))
      dispatch(tr)
    }

    return true
  }

const findAndReplacePlugin = (): Plugin<SearchState> =>
  new Plugin<SearchState>({
    key: findAndReplaceKey,
    state: {
      init: () => DecorationSet.empty as unknown as SearchState,
      apply(tr, prev, _, newState): SearchState {
        const allMatches: Match[] =
          searchText !== ''
            ? findMatches(newState.doc, searchText, matchCase)
            : []

        const createdDecorations = allMatches.length
          ? DecorationSet.create(
              newState.doc,
              allMatches.map(({ from, to }) =>
                Decoration.inline(from, to, { class: 'search-result' }),
              ),
            )
          : DecorationSet.empty

        return { createdDecorations, allMatches }
      },
    },
    props: {
      decorations: state =>
        findAndReplaceKey.getState(state).createdDecorations,
      setSearchText,
      setSearchMatchCase,
    } as Plugin<SearchState>['props'],
    view: () => ({ update: (): void => {} }),
  })

const findAndReplace: WaxFeature = {
  name: 'findAndReplace',
  plugins: () => ({ findAndReplacePlugin: findAndReplacePlugin() }),
}

export default findAndReplace

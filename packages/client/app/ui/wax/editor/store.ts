import type { EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

export type WaxSnapshot = {
  view: EditorView | undefined
  state: EditorState
}

export type WaxStore = {
  getSnapshot: () => WaxSnapshot
  subscribe: (listener: () => void) => () => void
  setSnapshot: (next: WaxSnapshot) => void
}

const createStore = (initialState: EditorState): WaxStore => {
  let snapshot: WaxSnapshot = { view: undefined, state: initialState }
  const listeners = new Set<() => void>()

  return {
    getSnapshot: (): WaxSnapshot => snapshot,
    subscribe: (listener): (() => void) => {
      listeners.add(listener)
      return (): void => {
        listeners.delete(listener)
      }
    },
    setSnapshot: (next): void => {
      snapshot = next
      listeners.forEach(listener => listener())
    },
  }
}

export default createStore

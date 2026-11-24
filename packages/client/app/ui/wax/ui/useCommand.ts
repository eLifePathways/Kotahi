import type { Command, EditorState } from 'prosemirror-state'
import type { EditorView } from 'prosemirror-view'

import { useWax } from '../editor'

type Query = (state: EditorState) => boolean

type CommandState = {
  view: EditorView | undefined
  active: boolean
  enabled: boolean
  run: () => void
}

const useCommand = (
  command: Command,
  isActive?: Query,
  isEnabled?: Query,
): CommandState => {
  const view: EditorView | undefined = useWax(s => s.view)

  const active: boolean = useWax(({ state }) =>
    Boolean(state && isActive && isActive(state)),
  )

  const enabled: boolean = useWax(({ state }) =>
    Boolean(state && (isEnabled ? isEnabled(state) : command(state))),
  )

  const run = (): void => {
    if (!view || !enabled) return
    command(view.state, view.dispatch, view)
    view.focus()
  }

  return { view, active, enabled, run }
}

export default useCommand

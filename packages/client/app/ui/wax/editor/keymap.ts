import { baseKeymap, chainCommands, exitCode } from 'prosemirror-commands'
import { redo, undo } from 'prosemirror-history'
import { keymap } from 'prosemirror-keymap'
import type { Command, Plugin } from 'prosemirror-state'

const insertBreak: Command = (state, dispatch) => {
  const br = state.schema.nodes.hard_break.create()
  dispatch?.(state.tr.replaceSelectionWith(br).scrollIntoView())
  return true
}

const defaultKeys: Record<string, Command> = {
  'Mod-z': undo,
  'Shift-Mod-z': redo,
  'Mod-y': redo,

  'Shift-Enter': chainCommands(exitCode, insertBreak),
}

const createKeymap = (shortcuts: Record<string, Command>[]): Plugin => {
  const commands: Record<string, Command[]> = {}
  const maps = [...shortcuts, defaultKeys, baseKeymap]

  maps.forEach(map => {
    Object.entries(map).forEach(([key, command]) => {
      commands[key] = [...(commands[key] ?? []), command]
    })
  })

  return keymap(
    Object.fromEntries(
      Object.entries(commands).map(([key, list]) => [
        key,
        chainCommands(...list),
      ]),
    ),
  )
}

export default createKeymap

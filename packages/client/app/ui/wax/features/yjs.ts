import { yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror'
import type { Plugin } from 'prosemirror-state'
import type { Awareness } from 'y-protocols/awareness'
import type { XmlFragment } from 'yjs'

import type { WaxFeature } from './types'

type YjsOptions = {
  type: XmlFragment
  awareness: Awareness
  showCursors?: boolean
}

const yjs = ({
  type,
  awareness,
  showCursors = true,
}: YjsOptions): WaxFeature => ({
  name: 'yjs',
  plugins: (): Record<string, Plugin> => {
    const plugins: Record<string, Plugin> = { ySyncPlugin: ySyncPlugin(type) }
    if (showCursors) plugins.yCursorPlugin = yCursorPlugin(awareness)
    plugins.yUndoPlugin = yUndoPlugin()
    return plugins
  },
})

export default yjs

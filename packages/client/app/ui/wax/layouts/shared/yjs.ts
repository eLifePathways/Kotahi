import { useMemo } from 'react'
import type { Awareness } from 'y-protocols/awareness'
import type { Doc } from 'yjs'

import yjs from '../../features/yjs'
import type { WaxFeature } from '../../features/types'

export type YjsProps = {
  wsProvider?: { awareness: Awareness; roomname?: string }
  ydoc?: Doc
  name?: string
}

const useYjsFeatures = ({ wsProvider, ydoc, name }: YjsProps): WaxFeature[] =>
  useMemo(
    () =>
      wsProvider && ydoc
        ? [
            yjs({
              type: ydoc.getXmlFragment(name || 'prosemirror'),
              awareness: wsProvider.awareness,
              showCursors: false,
            }),
          ]
        : [],
    [wsProvider, ydoc, name],
  )

export default useYjsFeatures

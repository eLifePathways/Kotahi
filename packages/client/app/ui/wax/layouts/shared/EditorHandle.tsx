import { useImperativeHandle, type ReactNode, type Ref } from 'react'

import { useWax } from '../../editor'
import { serialize } from '../../editor/htmlFormat'

export type EditorHandleRef = { getContent: () => string }

type EditorHandleProps = {
  editorRef?: Ref<EditorHandleRef>
}

const EditorHandle = ({ editorRef }: EditorHandleProps): ReactNode => {
  const view = useWax(s => s.view)

  useImperativeHandle(
    editorRef,
    () => ({
      getContent: (): string =>
        view ? serialize(view.state.schema, view.state.doc.content) : '',
    }),
    [view],
  )

  return null
}

export default EditorHandle

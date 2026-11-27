import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { baseKeymap } from 'prosemirror-commands'
import { keymap } from 'prosemirror-keymap'
import { EditorState } from 'prosemirror-state'
import { StepMap } from 'prosemirror-transform'
import { EditorView } from 'prosemirror-view'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import { redo, undo } from 'prosemirror-history'
import { useWax } from '../editor'
import { findNotes, type Note } from '../features/notes'
import { PanelEmpty, PanelHeading, PanelList, PanelMeta } from './Panel'

const FROM_MAIN = 'fromMainEditor'

const Mount = styled.div`
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  padding: ${grid(1)};

  .ProseMirror {
    outline: none;
  }
`

type NoteEditorProps = {
  note: Note
  view: EditorView
}

const NoteEditor = ({ note, view }: NoteEditorProps): ReactNode => {
  const mount = useRef<HTMLDivElement>(null)
  const inner = useRef<EditorView | null>(null)
  useEffect(() => {
    const findSelf = (): Note | undefined =>
      findNotes(view.state.doc).find(n => n.id === note.id)

    const onMain =
      (command: typeof undo) =>
      (_: EditorState, dispatch?: EditorView['dispatch']): boolean =>
        command(view.state, dispatch ? view.dispatch : undefined)

    const innerView = new EditorView(
      { mount: mount.current },
      {
        state: EditorState.create({
          doc: findSelf()?.node,
          plugins: [
            keymap({
              'Mod-z': onMain(undo),
              'Mod-y': onMain(redo),
              'Shift-Mod-z': onMain(redo),
            }),
            keymap(baseKeymap),
          ],
        }),
        dispatchTransaction(tr): void {
          const { state, transactions } = innerView.state.applyTransaction(tr)
          innerView.updateState(state)
          if (tr.getMeta(FROM_MAIN)) return

          const self = findSelf()
          if (!self) return

          const outer = view.state.tr
          const offset = StepMap.offset(self.pos + 1)

          transactions.forEach(t =>
            t.steps.forEach(step => outer.step(step.map(offset))),
          )

          if (outer.docChanged) view.dispatch(outer)
        },
      },
    )

    inner.current = innerView
    return (): void => innerView.destroy()
  }, [view, note.id])

  useEffect(() => {
    const innerView = inner.current
    if (!innerView || note.node.eq(innerView.state.doc)) return

    innerView.dispatch(
      innerView.state.tr
        .replaceWith(0, innerView.state.doc.content.size, note.node.content)
        .setMeta(FROM_MAIN, true),
    )
  }, [note.node])

  return <Mount aria-label={`Note ${note.number}`} ref={mount} />
}

type NotesPanelProps = {
  className?: string
}

const NotesPanel = ({ className }: NotesPanelProps): ReactNode => {
  const { view, state } = useWax()
  const { doc } = state
  const notes = useMemo(() => findNotes(doc), [doc])

  return (
    <PanelList aria-label="Notes" className={className} role="region">
      <PanelHeading>Notes</PanelHeading>
      {notes.length === 0 ? <PanelEmpty>No notes</PanelEmpty> : null}
      {view
        ? notes.map(note => (
            <div key={note.id}>
              <PanelMeta>{note.number}</PanelMeta>
              <NoteEditor note={note} view={view} />
            </div>
          ))
        : null}
    </PanelList>
  )
}

export default NotesPanel

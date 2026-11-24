import { useEffect, type ReactNode } from 'react'

import { useWax } from '../../editor'
import { serialize } from '../../editor/htmlFormat'
import useLatest from './useLatest'

type ActiveViewDomProps = { onChange?: (html: string) => void }

export const ActiveViewDom = ({ onChange }: ActiveViewDomProps): ReactNode => {
  const view = useWax(s => s.view)
  const state = useWax(s => s.state)

  useEffect(() => {
    if (onChange && view?.dom?.outerHTML) onChange(view.dom.outerHTML)
  }, [onChange, view, state])

  return null
}

type SaveOnUnmountProps = { onSave?: ((html: string) => void) | null }

export const SaveOnUnmount = ({ onSave }: SaveOnUnmountProps): ReactNode => {
  const view = useWax(s => s.view)
  const latest = useLatest({ view, onSave })

  useEffect(
    () => (): void => {
      const { view: current, onSave: save } = latest.current
      if (current && save)
        save(serialize(current.state.schema, current.state.doc.content))
    },
    [latest],
  )

  return null
}

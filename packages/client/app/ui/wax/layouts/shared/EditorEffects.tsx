import { useEffect, type ReactNode } from 'react'

import { useWax } from '../../editor'

type ActiveViewDomProps = { onChange?: (html: string) => void }

export const ActiveViewDom = ({ onChange }: ActiveViewDomProps): ReactNode => {
  const { view, state } = useWax()

  useEffect(() => {
    if (onChange && view?.dom?.outerHTML) onChange(view.dom.outerHTML)
  }, [onChange, view, state])

  return null
}

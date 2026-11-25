import type { FocusEvent, ReactNode } from 'react'

import { useWax } from '../../editor'
import { serialize } from '../../editor/htmlFormat'

type BlurAreaProps = {
  children: ReactNode
  className?: string
  onBlur?: (html: string) => void
}

const BlurArea = ({
  children,
  className,
  onBlur,
}: BlurAreaProps): ReactNode => {
  const { view } = useWax()

  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!onBlur || !view) return
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    onBlur(serialize(view.state.schema, view.state.doc.content))
  }

  return (
    <div className={className} onBlur={handleBlur}>
      {children}
    </div>
  )
}

export default BlurArea

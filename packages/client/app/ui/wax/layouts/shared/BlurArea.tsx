import type { FocusEvent, ReactNode } from 'react'

type BlurAreaProps = {
  children: ReactNode
  className?: string
  onBlur?: () => void
}

const BlurArea = ({
  children,
  className,
  onBlur,
}: BlurAreaProps): ReactNode => {
  const handleBlur = (event: FocusEvent<HTMLDivElement>): void => {
    if (!onBlur) return
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
    onBlur()
  }

  return (
    <div className={className} onBlur={handleBlur}>
      {children}
    </div>
  )
}

export default BlurArea

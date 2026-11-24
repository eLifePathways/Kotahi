import { useLayoutEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

import { useWax } from '../editor'

type Position = { top: number; left: number }

const Floating = styled.div`
  background: ${th('colorBackground')};
  border: 1px solid ${th('colorBorder')};
  border-radius: ${th('borderRadius')};
  box-shadow: 0 ${grid(0.5)} ${grid(2)} rgb(0 0 0 / 15%);
  max-width: calc(100vw - ${grid(4)});
  padding: ${grid(2)};
  position: fixed;
  z-index: 1000;
`

type SelectionOverlayProps = {
  children: ReactNode
  className?: string
  label: string
}

const SelectionOverlay = ({
  children,
  className,
  label,
}: SelectionOverlayProps): ReactNode => {
  const view = useWax(s => s.view)
  const to: number = useWax(({ state }) => state?.selection.to ?? 0)
  const [position, setPosition] = useState<Position | null>(null)

  useLayoutEffect(() => {
    if (!view) return undefined

    const place = (): void => {
      const coords = view.coordsAtPos(Math.max(0, to))
      setPosition({ top: coords.bottom + 8, left: coords.left })
    }

    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)

    return (): void => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [view, to])

  if (!position) return null

  return createPortal(
    <Floating
      aria-label={label}
      className={className}
      role="dialog"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </Floating>,
    document.body,
  )
}

export default SelectionOverlay

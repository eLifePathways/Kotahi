import type { ReactNode } from 'react'
import styled from 'styled-components'
import { grid, th } from '@coko/client'

type ToolbarProps = {
  children: ReactNode
  className?: string
}

const Wrapper = styled.div`
  align-items: center;
  border-bottom: 1px solid ${th('colorBorder')};
  display: flex;
  flex-wrap: wrap;
  gap: ${grid(0.5)};
  padding: ${grid(1)} 0;
`

export const ToolbarDivider = styled.span`
  align-self: stretch;
  border-left: 1px solid ${th('colorBorder')};
  margin: 0 ${grid(1)};
`

const Toolbar = ({ children, className }: ToolbarProps): ReactNode => (
  <Wrapper aria-label="Editor toolbar" className={className} role="toolbar">
    {children}
  </Wrapper>
)

export default Toolbar

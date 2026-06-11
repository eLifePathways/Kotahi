import { ReactNode } from 'react'
import styled from 'styled-components'

const StyledLayout = styled.div<{ $converting: boolean }>`
  display: flex;

  height: 100vh;
  width: 100vw;

  overflow: hidden;

  ${(props): string | false =>
    props.$converting &&
    `
    button,
    a {
      pointer-events: none;
    }
  `};

  > *:last-child {
    flex-grow: 1;
  }
`

type LayoutProps = {
  children: ReactNode
  converting: boolean
}

// TO DO - drop converting and xpub provider

const Layout = (props: LayoutProps): ReactNode => {
  const { converting = false, children } = props

  return <StyledLayout $converting={converting}>{children}</StyledLayout>
}

export default Layout

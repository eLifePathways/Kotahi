import { ReactNode } from 'react'
import styled from 'styled-components'

const StyledLayout = styled.div`
  display: flex;

  height: 100vh;
  width: 100vw;

  overflow: hidden;

  > *:last-child {
    flex-grow: 1;
    min-width: 0;
  }
`

type LayoutProps = {
  children: ReactNode
}

const Layout = (props: LayoutProps): ReactNode => {
  const { children } = props

  return <StyledLayout>{children}</StyledLayout>
}

export default Layout

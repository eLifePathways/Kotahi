import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

const Wrapper = styled.div`
  background: ${th('color.backgroundC')};
  /* display: flex; */
  /* flex-direction: column; */
  overflow: auto;
  padding: ${grid(3)};
  /* margin-top: ${grid(1)}; */
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const Header = styled.div`
  color: ${th('colorPrimary')};
  font-size: 2.2rem;
  margin-bottom: ${grid(3)};
  padding-bottom: ${grid(1.5)};
  border-bottom: 2px solid ${th('colorPrimary')};
  text-transform: capitalize;
`

const Content = styled.div`
  /* flex: 1; */
  min-height: 0;
  font-size: ${th('fontSizeBase')};
  padding-bottom: ${grid(3)};
`

type PageProps = {
  title: string
  children: ReactNode
}

const Page = ({ children, title }: PageProps): ReactNode => {
  return (
    <Wrapper>
      <Header>{title}</Header>
      <Content>{children}</Content>
    </Wrapper>
  )
}

export default Page

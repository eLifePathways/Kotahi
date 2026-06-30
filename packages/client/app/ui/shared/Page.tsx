import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid, th } from '@coko/client'

const Wrapper = styled.div`
  background: ${th('color.backgroundC')};
  overflow: auto;
  padding: ${grid(3)};
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const Header = styled.div`
  color: ${th('colorPrimary')};
  font-size: 2rem;
  margin-bottom: ${grid(3)};
  padding-bottom: ${grid(1.5)};
  border-bottom: 2px solid ${th('colorPrimary')};
  text-transform: capitalize;
  font-family: ${th('fontHeading')};
`

const Content = styled.div`
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

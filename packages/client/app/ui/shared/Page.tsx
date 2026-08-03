import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid, th, H1 } from '@coko/client'

const Wrapper = styled.div`
  background: ${th('colorWallpaper')};
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  padding: ${grid(6)};
  font-family: ${th('fontInterface')};
  line-height: ${th('lineHeightBase')};
`

const Header = styled(H1)`
  /* stylelint-disable declaration-no-important */
  margin-top: 0;
  margin-bottom: ${grid(6)};
  padding-bottom: ${grid(2)};
  border-bottom: 2px solid ${th('colorPrimary')};

  color: ${th('colorPrimary')} !important;
  text-transform: capitalize;

  font-family: ${th('fontHeading')};
  font-weight: normal !important;
`

const Content = styled.div`
  flex: 1;
  min-height: 0;
  font-size: ${th('fontSizeBase')};
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

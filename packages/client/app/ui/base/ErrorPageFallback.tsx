import { type ReactNode } from 'react'
import styled from 'styled-components'

import { grid } from '@coko/client'

import { CommsErrorBanner } from '../../components/shared'

const Wrapper = styled.div``

const Container = styled.div`
  display: grid;
  height: 10vh;
  place-items: center;
`

const Content = styled.div`
  margin-bottom: 1rem;
  max-width: 40em;
  padding: ${grid(4)};
  text-align: center;

  h1 {
    margin-bottom: ${grid(2)};
  }
`

const Centered = styled.div`
  text-align: center;
`

type ErrorPageFallbackProps = {
  className?: string
  error?: any
}

const ErrorPageFallback = (props: ErrorPageFallbackProps): ReactNode => {
  const { className, error } = props

  return (
    <Wrapper className={className}>
      <Container>
        <Centered>
          <Content>
            <CommsErrorBanner error={error} />
          </Content>
        </Centered>
      </Container>
    </Wrapper>
  )
}

export default ErrorPageFallback

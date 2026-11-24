import type { ReactNode } from 'react'
import styled from 'styled-components'
import { th } from '@coko/client'

import { useWax } from '../editor'

type WordCountProps = {
  className?: string
}

const Wrapper = styled.span`
  color: ${th('colorTextMuted')};
  font-size: ${th('fontSizeBaseSmall')};
`

const countWords = (text: string): number =>
  text.trim() ? text.trim().split(/\s+/).length : 0

const WordCount = ({ className }: WordCountProps): ReactNode => {
  const words: number = useWax(({ state }) =>
    state
      ? countWords(state.doc.textBetween(0, state.doc.content.size, ' ', ' '))
      : 0,
  )

  const characters: number = useWax(({ state }) =>
    state ? state.doc.textContent.length : 0,
  )

  return (
    <Wrapper aria-live="polite" className={className}>
      {words} words · {characters} characters
    </Wrapper>
  )
}

export default WordCount

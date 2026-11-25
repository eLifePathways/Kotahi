import { useMemo, type ReactNode } from 'react'
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
  const { doc } = useWax().state

  const words = useMemo(
    () => countWords(doc.textBetween(0, doc.content.size, ' ', ' ')),
    [doc],
  )

  const characters = useMemo(() => doc.textContent.length, [doc])

  return (
    <Wrapper aria-live="polite" className={className}>
      {words} words · {characters} characters
    </Wrapper>
  )
}

export default WordCount

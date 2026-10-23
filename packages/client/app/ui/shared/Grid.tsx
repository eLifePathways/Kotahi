import { Children, isValidElement, type ReactNode } from 'react'
import styled, { css, type RuleSet } from 'styled-components'
import { grid } from '@coko/client'

const Wrapper = styled.ul<{
  $minColumnWidth: number
  $minRowHeight?: number
  $gap: number
}>`
  display: grid;
  grid-template-columns: repeat(
    auto-fit,
    minmax(${(props): string => grid(props.$minColumnWidth)(props)}, 1fr)
  );
  gap: ${(props): string => grid(props.$gap)(props)};
  list-style: none;
  margin: 0 auto;
  padding: 0;

  ${(props): RuleSet | false =>
    props.$minRowHeight !== undefined &&
    css`
      grid-auto-rows: minmax(${grid(props.$minRowHeight)}, auto);
    `}
`

type GridProps = {
  className?: string
  children: ReactNode
  minColumnWidth: number
  minRowHeight?: number
  gap: number
}

// Children.toArray drops empty children.
// It also assigns keys if none were provided.
// isValidElement will fail if we pass a plain string or number, which will make
// the key undefined and react will complain.
const Grid = (props: GridProps): ReactNode => {
  const { className, children, minColumnWidth, minRowHeight, gap } = props

  return (
    <Wrapper
      $gap={gap}
      $minColumnWidth={minColumnWidth}
      $minRowHeight={minRowHeight}
      className={className}
    >
      {Children.toArray(children).map(child => (
        <li key={isValidElement(child) ? child.key : undefined}>{child}</li>
      ))}
    </Wrapper>
  )
}

export default Grid

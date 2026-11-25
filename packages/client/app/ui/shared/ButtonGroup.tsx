import React, { ComponentProps } from 'react'
import styled, { css } from 'styled-components'
import { grid, type ThemeValue } from '@coko/client'

import Button from './Button'

type ButtonElement = React.ReactElement<ComponentProps<typeof Button>>

type ButtonGroupProps = {
  children: ButtonElement | ButtonElement[]
  className?: string
  inline?: boolean
  justify?: 'left' | 'right' | 'center'
}

const Wrapper = styled.div<{
  $inline?: ButtonGroupProps['inline']
  $justify?: ButtonGroupProps['justify']
}>`
  display: ${(props): ThemeValue => (props.$inline ? 'inline-block' : 'flex')};

  ${(props): ThemeValue => {
    const { $inline, $justify } = props
    let justifyValue

    if ($inline) return null

    if ($justify === 'left') justifyValue = 'flex-start'
    if ($justify === 'right') justifyValue = 'flex-end'
    if ($justify === 'center') justifyValue = 'center'

    if (justifyValue)
      return css`
        justify-content: ${justifyValue};
      `

    return null
  }}

  > button {
    margin-right: ${grid(1)};
  }

  > button:first-child {
    margin-left: 0;
  }

  > button:last-child {
    margin-right: 0;
  }
`

const ButtonGroup = (props: ButtonGroupProps): React.ReactNode => {
  const { className, children, inline = false, justify = 'left' } = props

  return (
    <Wrapper $inline={inline} $justify={justify} className={className}>
      {children}
    </Wrapper>
  )
}

export default ButtonGroup

import React, { ComponentProps } from 'react'
import styled, { css } from 'styled-components'
import { Switch as AntSwitch } from 'antd'
import { grid, th, type ThemeValue } from '@coko/client'

type LabelPosition = 'left' | 'right'

type SwitchProps = ComponentProps<typeof AntSwitch> & {
  className?: string
  label?: string | null
  labelPosition?: LabelPosition
}

const Wrapper = styled.span`
  .ant-switch:focus-visible {
    outline: 2px solid ${th('colorPrimary')};
  }
`

const Label = styled.span<{ $labelPosition: LabelPosition }>`
  ${(props): ThemeValue =>
    props.$labelPosition === 'left' &&
    css`
      margin-right: ${grid(2)};
    `}

  ${(props): ThemeValue =>
    props.$labelPosition === 'right' &&
    css`
      margin-left: ${grid(2)};
    `}
`

const Switch = (props: SwitchProps): React.ReactNode => {
  const { className, label = null, labelPosition = 'right', ...rest } = props

  return (
    <Wrapper className={className}>
      {label && labelPosition === 'left' && (
        <Label $labelPosition={labelPosition}>{label}</Label>
      )}

      <AntSwitch {...rest} />

      {label && labelPosition === 'right' && (
        <Label $labelPosition={labelPosition}>{label}</Label>
      )}
    </Wrapper>
  )
}

export default Switch

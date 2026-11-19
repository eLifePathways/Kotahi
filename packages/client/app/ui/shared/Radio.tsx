import React, { ComponentProps } from 'react'
import styled, { css } from 'styled-components'
import { Radio as AntRadio, RadioChangeEvent } from 'antd'
import { type ThemeValue } from '@coko/client'

type RadioProps = Omit<ComponentProps<typeof AntRadio.Group>, 'onChange'> & {
  /** Handle change. First argument is the incoming `value`. */
  onChange?: ((value: string) => void) | null
  /** Arrange items vertically instead of inline. */
  vertical?: boolean
}

const StyledRadioGroup = styled(AntRadio.Group)<{
  $vertical: boolean
  role: string
}>`
  ${(props): ThemeValue =>
    props.$vertical &&
    css`
      display: flex;
      flex-direction: column;
    `}

  .ant-radio-inner,
  .ant-radio-inner::after,
  .ant-radio-checked,
  .ant-radio-button-wrapper,
  .ant-radio-button-wrapper::before {
    transition-duration: 0.1s;
  }
`

/**
 * Props are the same as Ant's RadioGroup https://ant.design/components/radio/#RadioGroup
 * with the addition of `vertical` and a slightly modified `onChange`.
 */
const Radio = (props: RadioProps): React.ReactNode => {
  const { className, onChange = null, vertical = false, ...rest } = props

  const handleChange = (e: RadioChangeEvent): void => {
    onChange?.(e.target.value)
  }

  return (
    <StyledRadioGroup
      $vertical={vertical}
      className={className}
      onChange={handleChange}
      role="radiogroup"
      {...rest}
    />
  )
}

export default Radio

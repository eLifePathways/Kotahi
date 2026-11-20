import { useState, type ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { Checkbox } from 'antd'
import { type ThemeValue } from '@coko/client'

import preview from '../../.storybook/preview'
import Button from '../../app/ui/shared/Button'
import ButtonGroup from '../../app/ui/shared/ButtonGroup'

const BorderedButtonGroup = styled(ButtonGroup)<{ $showBorder?: boolean }>`
  ${(props): ThemeValue =>
    props.$showBorder &&
    css`
      border: 2px dashed ${props.theme.colorBorder};
    `}
`

const Check = styled(Checkbox)`
  margin-bottom: 20px;
`

const buttons = [
  <Button key="cancel">Cancel</Button>,
  <Button key="save" type="primary">
    Save
  </Button>,
  <Button danger key="delete">
    Delete
  </Button>,
]

const BaseDemo = (): ReactNode => {
  const [showBorder, setShowBorder] = useState(false)
  const [inline, setInline] = useState(false)

  return (
    <>
      <p>Toggle the checkbox to see the difference of inline vs not inline</p>

      <Check checked={inline} onChange={(): void => setInline(!inline)}>
        Make inline
      </Check>

      <Check
        checked={showBorder}
        onChange={(): void => setShowBorder(!showBorder)}
      >
        Show border
      </Check>

      <div>
        <BorderedButtonGroup $showBorder={showBorder} inline={inline}>
          {buttons}
        </BorderedButtonGroup>
      </div>
    </>
  )
}

const meta = preview.meta({
  component: ButtonGroup,
})

export const Base = meta.story({
  render: () => <BaseDemo />,
})

export const Inline = meta.story({
  args: {
    inline: true,
    children: buttons,
  },
})

export const PullRight = meta.story({
  args: {
    justify: 'right',
    children: buttons,
  },
})

export const Center = meta.story({
  args: {
    justify: 'center',
    children: buttons,
  },
})

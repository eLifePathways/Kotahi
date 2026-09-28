import { th } from '@coko/client'
import styled from 'styled-components'

import preview from '../../.storybook/preview'
import Button from '../../app/ui/shared/Button'
import { ArrowRight, Plus } from '../../app/ui/base/Icons'

const ColoredBackground = styled.div`
  display: inline-flex;
  padding: 24px;
  background-color: ${th('colorPrimary')};
`

const meta = preview.meta({
  component: Button,
})

export const Primary = meta.story({
  args: {
    type: 'primary',
    children: 'Primary',
  },
})

export const Secondary = meta.story({
  args: {
    type: 'default',
    children: 'Secondary',
  },
})

export const PrimaryOutlined = meta.story({
  args: {
    type: 'primary',
    ghost: true,
    children: 'Outlined',
  },
})

export const PrimaryReverse = meta.story({
  render: () => (
    <ColoredBackground>
      <Button icon={<Plus aria-hidden />} reverse type="primary">
        New submission
      </Button>
    </ColoredBackground>
  ),
})

export const PrimaryOutlinedReverse = meta.story({
  render: () => (
    <ColoredBackground>
      <Button ghost icon={<Plus aria-hidden />} reverse type="primary">
        New submission
      </Button>
    </ColoredBackground>
  ),
})

export const Loading = meta.story({
  args: {
    type: 'primary',
    loading: true,
    children: 'Loading',
  },
})

export const WithIcon = meta.story({
  args: {
    type: 'primary',
    icon: <ArrowRight aria-hidden />,
    children: 'Continue',
  },
})

export const IconOnly = meta.story({
  args: {
    type: 'primary',
    icon: <ArrowRight aria-hidden />,
    'aria-label': 'Continue',
  },
})

export const ShortText = meta.story({
  args: {
    type: 'primary',
    children: 'OK',
  },
})

export const Medium = meta.story({
  args: {
    type: 'primary',
    size: 'medium',
    children: 'Medium',
  },
})

export const Small = meta.story({
  args: {
    type: 'primary',
    size: 'small',
    children: 'Small',
  },
})

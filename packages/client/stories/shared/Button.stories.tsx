import { Button } from '@coko/client'

import preview from '../../.storybook/preview'

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

import preview from '../../.storybook/preview'
import Badge from '../../app/ui/shared/Badge'

const meta = preview.meta({
  component: Badge,
})

export const Base = meta.story({
  args: {
    children: 'Enabled',
  },
})

export const Small = meta.story({
  args: {
    children: 'Enabled',
    small: true,
  },
})

export const Primary = meta.story({
  args: {
    children: 'Enabled',
    variant: 'primary',
  },
})

export const Success = meta.story({
  args: {
    children: 'Enabled',
    variant: 'success',
  },
})

export const Error = meta.story({
  args: {
    children: 'Enabled',
    variant: 'error',
  },
})

export const Warning = meta.story({
  args: {
    children: 'Enabled',
    variant: 'warning',
  },
})

export const Disabled = meta.story({
  args: {
    children: 'Enabled',
    variant: 'disabled',
  },
})

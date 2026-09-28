import preview from '../../.storybook/preview'
import BackLink from '../../app/ui/shared/BackLink'

const meta = preview.meta({
  component: BackLink,
})

export const Default = meta.story({
  args: {
    href: '/',
    label: 'Back to Dashboard',
  },
})

import preview from '../../.storybook/preview'
import Link from '../../app/ui/shared/Link'

const meta = preview.meta({
  component: Link,
})

export const Base = meta.story({
  args: {
    to: '#',
    children: 'View manuscript',
  },
})

import preview from '../../.storybook/preview'
import Empty from '../../app/ui/shared/Empty'

const meta = preview.meta({
  component: Empty,
})

export const Base = meta.story({})

export const Simple = meta.story({
  args: {
    description: 'No Data',
    image: Empty.PRESENTED_IMAGE_SIMPLE,
  },
})

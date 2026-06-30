import preview from '../../../.storybook/preview'
import CMS from '../../../app/ui/pages/cms/CMS'

const meta = preview.meta({
  component: CMS,
  parameters: {
    router: { initialEntries: ['/kotahi/cms'], path: '/:groupName/*' },
  },
})

export const Base = meta.story({})

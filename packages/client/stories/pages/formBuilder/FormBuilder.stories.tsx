import preview from '../../../.storybook/preview'
import FormBuilder from '../../../app/ui/pages/formBuilder/FormBuilder'

const meta = preview.meta({
  component: FormBuilder,
  parameters: {
    router: { initialEntries: ['/kotahi/form-builder'], path: '/:groupName/*' },
  },
})

export const Base = meta.story({})

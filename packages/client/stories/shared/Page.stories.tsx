import preview from '../../.storybook/preview'
import Page from '../../app/ui/shared/Page'

const meta = preview.meta({
  component: Page,
})

export const Base = meta.story({
  render: () => {
    return (
      <Page title="Dashboard">
        <div>some</div>
        <div>test</div>
      </Page>
    )
  },
})

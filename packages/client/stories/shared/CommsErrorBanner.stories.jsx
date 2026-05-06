import CommsErrorBanner from '../../app/components/shared/CommsErrorBanner'
import DesignEmbed from '../common/utils'

export const Base = args => <CommsErrorBanner {...args} />

Base.args = {}

export default {
  title: 'shared/CommsErrorBanner',
  component: CommsErrorBanner,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A76" />
      ),
    },
  },
}

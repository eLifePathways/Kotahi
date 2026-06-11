import Accordion from '../../app/components/shared/Accordion'
import DesignEmbed from '../common/utils'

export const Base = args => (
  <Accordion {...args}>
    <div>This is the content of the accordion</div>
  </Accordion>
)

Base.args = {
  label: 'Accordion label',
  isOpenInitially: false,
}

export default {
  title: 'shared/Accordion',
  component: Accordion,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A76" />
      ),
    },
  },
}

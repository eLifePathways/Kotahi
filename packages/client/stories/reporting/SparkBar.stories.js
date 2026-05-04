import { SparkBar } from '../../app/components/component-reporting/src'
import DesignEmbed from '../common/utils'

export const Base = args => (
  <>
    {args.figmaEmbedLink && (
      <>
        <h2 style={{ color: '#333333' }}>Design</h2>
        <iframe
          allowFullScreen
          height={350}
          src={args.figmaEmbedLink}
          style={{ border: '1px solid rgba(0, 0, 0, 0.1)' }}
          title="figma embed"
          width="100%"
        />
        <h2 style={{ color: '#333333' }}>Component</h2>
      </>
    )}
    <SparkBar {...args} />
  </>
)
export const Clickable = Base.bind()

Base.args = {
  value: 5,
  rangeMax: 10,
}

Clickable.args = {
  value: 5,
  rangeMax: 10,
  // eslint-disable-next-line no-alert
  onClick: () => window.alert('Clicked!'),
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A58',
}

export default {
  title: 'Reporting/SparkBar',
  component: SparkBar,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A56" />
      ),
    },
  },
  argTypes: {
    value: { control: { type: 'number' } },
    rangeMax: { control: { type: 'number' } },
    onClick: { control: { type: 'function' } },
  },
}

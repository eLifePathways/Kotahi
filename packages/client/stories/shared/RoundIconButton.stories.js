import RoundIconButton from '../../app/components/shared/RoundIconButton'
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
    <RoundIconButton {...args}>{args.label}</RoundIconButton>
  </>
)

Base.args = {
  disabled: false,
  iconName: 'Video',
  primary: false,
  title: 'Open video chat',
}

export default {
  title: 'Shared/RoundIconButton',
  component: RoundIconButton,
  argTypes: { onClick: { action: 'clicked' } },
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A79" />
      ),
    },
  },
}

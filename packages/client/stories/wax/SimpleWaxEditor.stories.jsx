import SimpleWaxEditor from '../../app/components/wax-collab/src/SimpleWaxEditor'
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
    <SimpleWaxEditor {...args} />
  </>
)
export const ReadOnly = Base.bind()
export const Error = Base.bind()

Base.args = {
  value: '<p>Some <strong><i>styled</i></strong> text</p>',
  autoFocus: true,
  placeholder: 'Enter text here',
  onBlur: () => {},
}
ReadOnly.args = {
  ...Base.args,
  readonly: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A118',
}
Error.args = {
  ...Base.args,
  validationStatus: 'error',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A121',
}

export default {
  title: 'Wax/SimpleWaxEditor',
  component: SimpleWaxEditor,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A115" />
      ),
    },
  },
}

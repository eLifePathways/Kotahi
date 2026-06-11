import ProductionWaxEditor from '../../app/components/wax-collab/src/ProductionWaxEditor'
import DesignEmbed from '../common/utils'
import { JournalProvider } from '../../app/components/xpub-journal'
import journal from '../../config/journal'

export const Base = args => (
  <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
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
      <ProductionWaxEditor {...args} />
    </>
  </JournalProvider>
)
export const ReadOnly = Base.bind()
export const Error = Base.bind()
export const NoComments = Base.bind()

Base.args = {
  value: `<p class="paragraph">Some <strong><em>styled</em></strong> text</p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`,
  autoFocus: true,
  placeholder: 'Enter text here',
  onBlur: () => {},
}
ReadOnly.args = {
  ...Base.args,
  readonly: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A109',
}
Error.args = {
  ...Base.args,
  validationStatus: 'error',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D335%253A2',
}
NoComments.args = {
  ...Base.args,
  useComments: false,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A112',
}

export default {
  title: 'Wax/ProductionWaxEditor',
  component: ProductionWaxEditor,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A106" />
      ),
    },
  },
  argTypes: {
    onBlur: {
      action: 'clicked',
    },
  },
}

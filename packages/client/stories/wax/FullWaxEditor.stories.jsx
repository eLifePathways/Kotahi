import FullWaxEditor from '../../app/components/wax-collab/src/FullWaxEditor'
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
      <FullWaxEditor {...args} />
    </>
  </JournalProvider>
)
export const ReadOnly = Base.bind()
export const Error = Base.bind()
export const WithComments = Base.bind()
export const ReadOnlyWithComments = Base.bind()
export const ReadOnlyWithAuthorComments = Base.bind()

Base.args = {
  value: `<p class="paragraph">Some <strong><em>styled</em></strong> text</p><p class="paragraph">A second <span class="comment" data-id="807c5dba-f8a4-4f64-b1cd-cf9e83a2f64c" data-conversation="[{&quot;content&quot;:&quot;This is a note.&quot;,&quot;displayName&quot;:&quot;dummy editor&quot;,&quot;timestamp&quot;:1632132399423}]" data-viewid="main" data-group="main">paragraph</span>.</p>`,
  autoFocus: true,
  placeholder: 'Enter text here',
}
ReadOnly.args = {
  ...Base.args,
  readonly: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A91',
}
Error.args = {
  ...Base.args,
  validationStatus: 'error',
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A95',
}
WithComments.args = {
  ...Base.args,
  useComments: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A97',
}
ReadOnlyWithComments.args = {
  ...Base.args,
  useComments: true,
  readonly: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A100',
}
ReadOnlyWithAuthorComments.args = {
  ...Base.args,
  useComments: true,
  readonly: true,
  authorComments: true,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A103',
}

export default {
  title: 'Wax/FullWaxEditor',
  component: FullWaxEditor,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A89" />
      ),
    },
  },
}

import { TableRow } from '../../app/components/component-reporting/src'
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
    <TableRow {...args} />
  </>
)
export const Headings = Base.bind()

Base.args = {
  cells: [
    { width: '7em', content: '2021-05-10' },
    { width: '7em', content: 'Dataset' },
    { width: '12em', flexGrow: 1, content: 'Joe Bloggs' },
    {
      width: '16em',
      flexGrow: 4,
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      content: <a href="#">Manuscript 123</a>,
    },
    { width: '6.5em', content: 1234 },
    { width: '6em', content: 'Reviewed' },
    { width: '5em', content: '8 days' },
    { width: '6em', content: 'Accepted' },
    { width: '7em', content: '2021-05-23' },
  ],
}

Headings.args = {
  cells: [
    { width: '7em', content: 'Entry date', isHeading: true },
    { width: '7em', content: 'Submission type', isHeading: true },
    {
      width: '12em',
      flexGrow: 1,
      content: 'Corresponding author',
      isHeading: true,
    },
    { width: '16em', flexGrow: 4, content: 'Title', isHeading: true },
    { width: '6.5em', content: 'Manuscript number', isHeading: true },
    { width: '6em', content: 'Review status', isHeading: true },
    { width: '5em', content: 'Review duration', isHeading: true },
    { width: '6em', content: 'Revision status', isHeading: true },
    { width: '7em', content: 'Published date', isHeading: true },
  ],
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A73',
}

export default {
  title: 'Reporting/TableRow',
  component: TableRow,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A70" />
      ),
    },
  },
  argTypes: {},
}

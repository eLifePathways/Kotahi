import { Table } from '../../app/components/component-reporting/src'
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
    <Table {...args} />
  </>
)
export const WithHeadings = Base.bind()
export const WithSomeHeadings = Base.bind()

const rows = [
  [
    1234,
    '2021-05-10',
    `Wigwams for Gooses' Bridles: a comparative study`,
    'Jack Horner',
    'Editor 1, Editor 2',
    'Reviewer 1, Reviewer 2, Reviewer 3',
    { content: 'revising', isHeading: true },
    null,
  ],
]

Base.args = {
  // prettier-ignore
  columnSchemas: [
    { width: '6.5em' },
    { width: '7em' },
    { width: '16em', flexGrow: 4 },
    { width: '12em', flexGrow: 1 },
    { width: '12em', flexGrow: 3 },
    { width: '14em', flexGrow: 3 },
    { width: '6em' },
    { width: '7em' },
  ],
  rows,
}

WithHeadings.args = {
  // prettier-ignore
  columnSchemas: [
    { heading: 'Manuscript number', width: '6.5em' },
    { heading: 'Entry date', width: '7em' },
    { heading: 'Title', width: '16em', flexGrow: 4 },
    { heading: 'Corresponding author', width: '12em', flexGrow: 1 },
    { heading: 'Editors', width: '12em', flexGrow: 3 },
    { heading: 'Reviewers', width: '14em', flexGrow: 3 },
    { heading: 'Status', width: '6em' },
    { heading: 'Published date', width: '7em' },
  ],
  rows,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A64',
}

WithSomeHeadings.args = {
  // prettier-ignore
  columnSchemas: [
    { width: '6.5em' },
    { width: '7em' },
    { heading: 'Title', width: '16em', flexGrow: 4 },
    { width: '12em', flexGrow: 1 },
    { heading: 'Editors', width: '12em', flexGrow: 3 },
    { heading: 'Reviewers', width: '14em', flexGrow: 3 },
    { width: '6em' },
    { width: '7em' },
  ],
  rows,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A67',
}

export default {
  title: 'Reporting/Table',
  component: Table,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A61" />
      ),
    },
  },
  argTypes: {},
}

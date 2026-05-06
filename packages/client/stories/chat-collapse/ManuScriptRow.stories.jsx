import ManuscriptsTable from '../../app/components/component-manuscripts-table/src/ManuscriptsTable'
import ManuscriptRow from '../../app/components/component-manuscripts-table/src/ManuscriptRow'
import DefaultField from '../../app/components/component-manuscripts-table/src/cell-components/DefaultField'
import DesignEmbed from '../common/utils'

const ColumnsProps = [
  {
    name: 'shortId',
    title: 'Manuscript number',
    defaultSortDirection: 'DESC',
    flex: '0 1 6em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
  {
    name: 'submission.$title',
    title: 'Title',
    defaultSortDirection: 'ASC',
    flex: '1 0.5 16em',
    canSort: true,
    filterOptions: null,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
  {
    name: 'created',
    title: 'Created',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: 'DESC',
    component: DefaultField,
  },
  {
    name: 'updated',
    title: 'Updated',
    defaultSortDirection: 'DESC',
    flex: '0 1 7em',
    canSort: true,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
  {
    name: 'status',
    title: 'Status',
    defaultSortDirection: null,
    flex: '0 1 10em',
    filterOptions: [
      {
        label: 'Unsubmitted',
        value: 'new',
      },
      {
        label: 'Submitted',
        value: 'submitted',
      },
      {
        label: 'Accepted',
        value: 'accepted',
      },
      {
        label: 'Rejected',
        value: 'rejected',
      },
      {
        label: 'Revise',
        value: 'revise',
      },
      {
        label: 'Revising',
        value: 'revising',
      },
      {
        label: 'Published',
        value: 'published',
      },
    ],
    canSort: false,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
  {
    name: 'author',
    title: 'Author',
    defaultSortDirection: null,
    flex: '0 1 16em',
    canSort: false,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
  {
    name: 'actions',
    title: '',
    defaultSortDirection: null,
    flex: '0 1 6em',
    extraProps: {},
    canSort: false,
    filterValue: null,
    sortDirection: null,
    component: DefaultField,
  },
]

export const Base = args => <ManuscriptRow {...args} />

Base.args = {
  columnDefinitions: ColumnsProps,
  manuscript: {
    __typename: 'Manuscript',
    id: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
    shortId: 2,
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: '297574d0-686c-4b1e-9cbc-3f3d8d86f8e2',
    },
    submission: {
      irb: 'yes',
      name: 'shanthi',
      cover:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      links: [],
      $title: 'New submission 1/7/2022, 12:13:19 AM',
      ethics:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      contact: 'shanthitestemail@mailinator.com',
      methods: ['PET', 'Diffusion MRI', 'Behavior'],
      $abstract:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      datacode:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      humanMRI: '2T',
      keywords: 'Data and Code availability statements',
      packages: ['Free Surfer', 'SPM'],
      subjects: 'healthy_subjects',
      suggested: 'shanthitestemail@mailinator.com',
      objectType: 'software',
      references:
        '<p class="paragraph"><strong>Lorem Ipsum</strong>&nbsp;is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>',
      affiliation: 'Research Object Submission Form',
      otherMethods:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      humanMRIother:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      otherPackages:
        'Cover letter describing submission, relevant implications, and timely information to consider',
      animal_research_approval: 'N/A',
    },
    created: '2022-01-06T18:43:19.372Z',
    updated: '2022-01-06T18:44:34.915Z',
    status: 'new',
    published: null,
    teams: [
      {
        __typename: 'Team',
        id: '0e7766d4-350b-4179-88b4-3eefea1f884e',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: 'e51bb0ef-100e-4256-85ce-389c7702abbc',
            user: {
              __typename: 'User',
              id: '20ca2a8d-d78e-4260-baed-86369992353f',
              username: 'Shanthi',
            },
          },
        ],
      },
    ],
    manuscriptVersions: [],
    submitter: {
      __typename: 'User',
      username: 'Shanthi',
      isOnline: null,
      defaultIdentity: {
        __typename: 'Identity',
        id: '661c6b4f-5b5b-4ef0-aa4e-7d7b5bb38628',
        identifier: '0000-0002-2473-4784',
        name: 'Shanthi ',
      },
      profilePicture: null,
    },
  },
}

export default {
  title: 'Manuscripts/ManuscriptRow',
  component: ManuscriptsTable,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1%253A31" />
      ),
    },
  },
}

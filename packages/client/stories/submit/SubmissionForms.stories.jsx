import { JournalProvider } from '../../app/components/xpub-journal'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import journal from '../../config/journal'
import DesignEmbed from '../common/utils'
import SubmissionForm from '../../app/components/component-submit/src/components/SubmissionForm'
import { ConfigProvider } from '../../app/components/config/src'
import config from '../../config/sampleConfigFormData'

export const Base = args => (
  <XpubProvider>
    <JournalProvider journal={JSON.parse(JSON.stringify(journal))}>
      <ConfigProvider config={config}>
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
          <SubmissionForm {...args} />
        </>
      </ConfigProvider>
    </JournalProvider>
  </XpubProvider>
)

export const EmptySubmissionForm = Base.bind()

const baseProps = {
  client: () => {},
  versionValues: {
    __typename: 'Manuscript',
    id: '8bdccd35-51fc-42a1-af84-951f3c21c91c',
    shortId: 9,
    created: '2022-04-08T10:11:03.002Z',
    files: [],
    reviews: [],
    teams: [
      {
        __typename: 'Team',
        id: '0fc39aa7-cc0c-48c7-9cf8-b70f441d6490',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: 'a29521d6-75e2-4e2f-8f52-270a21302c96',
            user: {
              __typename: 'User',
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
            },
          },
        ],
      },
    ],
    decision: '',
    status: 'submitted',
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: '8bdccd35-51fc-42a1-af84-951f3c21c91c',
      source: null,
      history: null,
    },
    authors: null,
    submission: {
      $title: 'New submission 08/04/2022, 15:41:02',
      objectType: 'software',
      $authors: [],
      topics: ['Topic 2'],
      $doi: 'TESTDOI',
      $abstract: '<p class="paragraph">This is a test abstract</p>',
      AuthorCorrespondence: 'Test entry',
      cover: '<p class="paragraph">Test content</p>',
      EditorsEvaluation: 'This is a test evaluation',
      datacode: '<p class="paragraph">This is a test statement</p>',
      competingInterests: '<p class="paragraph">test interest</p>',
      Funding: '50K USD',
      authorContributions: 'Test contribution',
      DecisionLetter: '<p class="paragraph">Test response</p>',
      references: '<p class="paragraph">Test reference</p>',
      reviewingEditor: [
        {
          id: '93a72720-2968-4a63-b098-b33944ee1ec0',
          email: 'test@kotahidev.com',
          lastName: 'kandpal',
          firstName: 'Pankaj',
          affiliation: 'Test affiliation',
        },
      ],
      copyrightHolder: 'Test copyright holder',
      copyrightStatement: 'Copyright statement',
      copyrightYear: 'Test copyright',
      dateReceived: '07.01.2021',
      dateAccepted: '07.01.2021',
      datePublished: '07.01.2021',
      title: '',
    },
    manuscriptVersions: [],
    channels: [
      {
        __typename: 'Channel',
        id: '0fc11605-db3b-41d3-99e2-7eabec0618d1',
        type: 'all',
        topic: 'Manuscript discussion',
      },
      {
        __typename: 'Channel',
        id: '6c344a06-52b5-4eec-bbae-5aac1e8706ff',
        type: 'editorial',
        topic: 'Editorial discussion',
      },
    ],
  },
  form: {
    __typename: 'FormStructure',
    name: 'Research Object Submission Form',
    description:
      '<p>Please fill out the form below to complete your submission.</p>',
    haspopup: 'true',
    popuptitle:
      'By submitting the manuscript, you agree to the following statements.',
    popupdescription:
      '<p>The corresponding author confirms that all co-authors are included, and that everyone listed as a co-author agrees to that role and all the following requirements and acknowledgements:</p><p></p><p>The submission represents original work and sources are given proper attribution. The journal employs CrossCheck to compare submissions against a large and growing database of published scholarly content. If in the judgment of a senior editor a submission is genuinely suspected of plagiarism, it will be returned to the author(s) with a request for explanation.</p><p></p><p>The research was conducted in accordance with ethical principles.</p><p></p><p>There is a Data Accessibility Statement, containing information about the location of open data and materials, in the manuscript.</p><p></p><p>A conflict of interest statement is present in the manuscript, even if to state no conflicts of interest.</p>',
    children: [
      {
        __typename: 'FormElement',
        title: 'Type of Research Object',
        id: 'fa0c39ca-0486-4e29-ba24-f86f7d375c3f',
        component: 'Select',
        name: 'submission.objectType',
        options: [
          {
            __typename: 'FormElementOption',
            id: 'df5fc212-b055-4cba-9d0e-e85222e3d4f2',
            label: 'Dataset',
            value: 'dataset',
          },
          {
            __typename: 'FormElementOption',
            id: 'ef2ddada-105a-412e-8d7f-56b1df44c02f',
            label: 'Software',
            value: 'software',
          },
          {
            __typename: 'FormElementOption',
            id: '0fafbfc3-6797-46e3-aff4-3fd4f16261b1',
            label: 'Figure',
            value: 'figure',
          },
          {
            __typename: 'FormElementOption',
            id: '5117a7c6-2fcf-414b-ac60-47f8d93ccfef',
            label: 'Notebook',
            value: 'notebook',
          },
          {
            __typename: 'FormElementOption',
            id: '32121b38-b855-465e-b039-b5100177698b',
            label: 'Research article ',
            value: 'Research article ',
          },
        ],
      },
      {
        __typename: 'FormElement',
        title: 'Title',
        id: '47fd802f-ed30-460d-9617-c8a9b9025e95',
        component: 'TextField',
        name: 'submission.$title',
        placeholder: "Enter the manuscript's title",
      },
      {
        __typename: 'FormElement',
        title: 'Author names',
        id: 'd76e5b3c-eeaa-4168-9318-95d43a31e3e4',
        component: 'AuthorsInput',
        name: 'submission.$authors',
      },
      {
        __typename: 'FormElement',
        title: 'Topics',
        id: '62ca72ad-04b0-41fc-85d1-415469d7e895',
        component: 'CheckboxGroup',
        name: 'submission.topics',
        options: [
          {
            __typename: 'FormElementOption',
            id: '2323b6d1-8223-45e8-a0fc-1044a1e39d37',
            label: 'Neuropsychology ',
            value: 'Neuropsychology ',
          },
          {
            __typename: 'FormElementOption',
            id: 'ac7cafca-c5c8-4940-9f2f-014d18660e90',
            label: 'Topic 2',
            value: 'Topic 2',
          },
          {
            __typename: 'FormElementOption',
            id: '93c88240-9c2b-4c23-9301-23ed94ef61d7',
            label: 'Topic 3',
            value: 'Topic 3',
          },
        ],
      },
      {
        __typename: 'FormElement',
        title: 'DOI',
        id: '1c2e9325-3fa8-41f3-8607-180eb8a25aa3',
        component: 'TextField',
        name: 'submission.$doi',
        doiValidation: 'true',
        placeholder: "Enter the manuscript's DOI",
      },
      {
        __typename: 'FormElement',
        title: 'Abstract',
        shortDescription: 'Abstract',
        id: 'd80b2c88-6144-4003-b671-63990b9b2793',
        component: 'AbstractEditor',
        name: 'submission.$abstract',
        description: '<p>Please provide a short summary of your submission</p>',
        placeholder: 'Input your abstract...',
      },
      {
        __typename: 'FormElement',
        title: 'Author correspondence ',
        id: '7f5aa395-3486-4067-b636-ae204d472c16',
        component: 'TextField',
        name: 'submission.AuthorCorrespondence',
      },
      {
        __typename: 'FormElement',
        title: 'Cover letter',
        id: '347dc171-f008-45ac-8433-ca0711bf213c',
        component: 'AbstractEditor',
        name: 'submission.cover',
        description:
          '<p>Cover letter describing submission, relevant implications, and timely information to consider</p>',
        placeholder: 'Enter your cover letter',
      },
      {
        __typename: 'FormElement',
        title: 'Editors evaluation ',
        id: '14b8da7d-5924-4098-8d1f-e528c7c440b9',
        component: 'TextField',
        name: 'submission.EditorsEvaluation',
      },
      {
        __typename: 'FormElement',
        title: 'Data and Code availability statements',
        id: 'bf2f9b4a-377b-4303-8f51-70d836eb1456',
        component: 'AbstractEditor',
        name: 'submission.datacode',
        placeholder: 'Enter your data and code availability statement',
      },
      {
        __typename: 'FormElement',
        title: 'Competing interests',
        id: 'fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a',
        component: 'AbstractEditor',
        name: 'submission.competingInterests',
      },
      {
        __typename: 'FormElement',
        title: 'Funding',
        id: '6bfdc237-814d-4af8-b0f0-064099d679ba',
        component: 'TextField',
        name: 'submission.Funding',
      },
      {
        __typename: 'FormElement',
        title: 'Upload supplementary materials',
        id: 'b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0',
        component: 'SupplementaryFiles',
        name: 'fileName',
      },
      {
        __typename: 'FormElement',
        title: 'Author contributions ',
        id: 'b127ecb1-4862-4662-a958-3266eb284353',
        component: 'TextField',
        name: 'submission.authorContributions',
      },
      {
        __typename: 'FormElement',
        title: 'Decision letter and author response',
        id: '6342cff7-c57a-4fd9-b91d-c4cf77b4c309',
        component: 'AbstractEditor',
        name: 'submission.DecisionLetter',
      },
      {
        __typename: 'FormElement',
        title: 'References ',
        id: 'e8af0c63-e46f-46a8-bc90-5023fe50a541',
        component: 'AbstractEditor',
        name: 'submission.references',
      },
      {
        __typename: 'FormElement',
        title: 'Reviewing editors name ',
        id: 'ebe75cec-0ba8-4f00-9024-20e77ed94f1c',
        component: 'AuthorsInput',
        name: 'submission.reviewingEditor',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright holder',
        id: '6871680a-2278-40b3-80c6-7de06f21aafb',
        component: 'TextField',
        name: 'submission.copyrightHolder',
        description: '<p class="paragraph">e.g. British Medical Journal </p>',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright statement ',
        id: '1e9ff636-f850-4d20-b079-36af49fa4ad1',
        component: 'TextField',
        name: 'submission.copyrightStatement',
        description:
          '<p class="paragraph">e.g. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright year ',
        id: '7617c919-4413-4306-b709-ef78c3110c3f',
        component: 'TextField',
        name: 'submission.copyrightYear',
        description: '<p class="paragraph">e.g. 2022</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date received ',
        id: '6deaacc6-759a-4a68-b494-c38c664bb665',
        component: 'TextField',
        name: 'submission.dateReceived',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date accepted',
        id: '8b858adc-5f65-4385-9f79-5c5af1f67bd5',
        component: 'TextField',
        name: 'submission.dateAccepted',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date published ',
        id: 'f6e46890-4b96-4c90-ab48-b4fc5abb9b40',
        component: 'TextField',
        name: 'submission.datePublished',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
    ],
  },
  confirming: false,
  match: {
    path: '/kotahi/versions/:version/submit',
    url: '/kotahi/versions/8bdccd35-51fc-42a1-af84-951f3c21c91c/submit',
    isExact: true,
    params: {
      version: '8bdccd35-51fc-42a1-af84-951f3c21c91c',
    },
  },
  manuscript: {
    __typename: 'Manuscript',
    id: '8bdccd35-51fc-42a1-af84-951f3c21c91c',
    shortId: 9,
    created: '2022-04-08T10:11:03.002Z',
    files: [],
    reviews: [],
    teams: [
      {
        __typename: 'Team',
        id: '0fc39aa7-cc0c-48c7-9cf8-b70f441d6490',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: 'a29521d6-75e2-4e2f-8f52-270a21302c96',
            user: {
              __typename: 'User',
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
            },
          },
        ],
      },
    ],
    decision: '',
    status: 'submitted',
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: '8bdccd35-51fc-42a1-af84-951f3c21c91c',
      source: null,
      history: null,
    },
    authors: null,
    submission:
      '{"$doi":"TESTDOI","cover":"<p class=\\"paragraph\\">Test content</p>","$title":"New submission 08/04/2022, 15:41:02","topics":["Topic 2"],"Funding":"50K USD","$abstract":"<p class=\\"paragraph\\">This is a test abstract</p>","datacode":"<p class=\\"paragraph\\">This is a test statement</p>","objectType":"software","references":"<p class=\\"paragraph\\">Test reference</p>","$authors":"","dateAccepted":"07.01.2021","dateReceived":"07.01.2021","copyrightYear":"Test copyright","datePublished":"07.01.2021","DecisionLetter":"<p class=\\"paragraph\\">Test response</p>","copyrightHolder":"Test copyright holder","reviewingEditor":[{"id":"93a72720-2968-4a63-b098-b33944ee1ec0","email":"test@kotahidev.com","lastName":"kandpal","firstName":"Pankaj","affiliation":"Test affiliation"}],"EditorsEvaluation":"This is a test evaluation","competingInterests":"<p class=\\"paragraph\\">test interest</p>","copyrightStatement":"Copyright statement","authorContributions":"Test contribution","AuthorCorrespondence":"Test entry"}',
    manuscriptVersions: [],
    channels: [
      {
        __typename: 'Channel',
        id: '0fc11605-db3b-41d3-99e2-7eabec0618d1',
        type: 'all',
        topic: 'Manuscript discussion',
      },
      {
        __typename: 'Channel',
        id: '6c344a06-52b5-4eec-bbae-5aac1e8706ff',
        type: 'editorial',
        topic: 'Editorial discussion',
      },
    ],
    formFieldsToPublish: [],
  },
  threadedDiscussions: [],
  updatePendingComment: () => null,
}

Base.args = baseProps

const emptyFormProps = {
  client: () => {},
  versionValues: {
    __typename: 'Manuscript',
    id: 'a358cf5a-fa07-4622-8544-f507974aefc5',
    shortId: 10,
    created: '2022-04-11T12:15:11.436Z',
    files: [],
    reviews: [],
    teams: [
      {
        __typename: 'Team',
        id: '9be4732b-fe11-4eed-bf91-a586ec3b2dc6',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: '6e4c093a-9e9c-459c-9de1-74827326eb64',
            user: {
              __typename: 'User',
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
            },
          },
        ],
      },
    ],
    decision: '',
    status: 'new',
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: 'a358cf5a-fa07-4622-8544-f507974aefc5',
      source: null,
      history: null,
    },
    authors: null,
    submission: {
      $title: '',
      objectType: '',
      $authors: [],
      topics: [],
      $doi: '',
      $abstract: '',
      AuthorCorrespondence: '',
      cover: '',
      EditorsEvaluation: '',
      datacode: '',
      competingInterests: '',
      Funding: '',
      authorContributions: '',
      DecisionLetter: '',
      references: '',
      reviewingEditor: '',
      copyrightHolder: '',
      copyrightStatement: '',
      copyrightYear: '',
      dateReceived: '',
      dateAccepted: '',
      datePublished: '',
    },
    manuscriptVersions: [],
    channels: [
      {
        __typename: 'Channel',
        id: 'c80f01c1-c07d-4cae-acf6-5841c637ab2d',
        type: 'all',
        topic: 'Manuscript discussion',
      },
      {
        __typename: 'Channel',
        id: '2df5821b-ec12-48d7-9cfe-545766bb3aab',
        type: 'editorial',
        topic: 'Editorial discussion',
      },
    ],
  },
  form: {
    __typename: 'FormStructure',
    name: 'Research Object Submission Form',
    description:
      '<p>Please fill out the form below to complete your submission.</p>',
    haspopup: 'true',
    popuptitle:
      'By submitting the manuscript, you agree to the following statements.',
    popupdescription:
      '<p>The corresponding author confirms that all co-authors are included, and that everyone listed as a co-author agrees to that role and all the following requirements and acknowledgements:</p><p></p><p>The submission represents original work and sources are given proper attribution. The journal employs CrossCheck to compare submissions against a large and growing database of published scholarly content. If in the judgment of a senior editor a submission is genuinely suspected of plagiarism, it will be returned to the author(s) with a request for explanation.</p><p></p><p>The research was conducted in accordance with ethical principles.</p><p></p><p>There is a Data Accessibility Statement, containing information about the location of open data and materials, in the manuscript.</p><p></p><p>A conflict of interest statement is present in the manuscript, even if to state no conflicts of interest.</p>',
    children: [
      {
        __typename: 'FormElement',
        title: 'Type of Research Object',
        id: 'fa0c39ca-0486-4e29-ba24-f86f7d375c3f',
        component: 'Select',
        name: 'submission.objectType',
        options: [
          {
            __typename: 'FormElementOption',
            id: 'df5fc212-b055-4cba-9d0e-e85222e3d4f2',
            label: 'Dataset',
            value: 'dataset',
          },
          {
            __typename: 'FormElementOption',
            id: 'ef2ddada-105a-412e-8d7f-56b1df44c02f',
            label: 'Software',
            value: 'software',
          },
          {
            __typename: 'FormElementOption',
            id: '0fafbfc3-6797-46e3-aff4-3fd4f16261b1',
            label: 'Figure',
            value: 'figure',
          },
          {
            __typename: 'FormElementOption',
            id: '5117a7c6-2fcf-414b-ac60-47f8d93ccfef',
            label: 'Notebook',
            value: 'notebook',
          },
          {
            __typename: 'FormElementOption',
            id: '32121b38-b855-465e-b039-b5100177698b',
            label: 'Research article ',
            value: 'Research article ',
          },
        ],
      },
      {
        __typename: 'FormElement',
        title: 'Title',
        id: '47fd802f-ed30-460d-9617-c8a9b9025e95',
        component: 'TextField',
        name: 'submission.$title',
        placeholder: "Enter the manuscript's title",
      },
      {
        __typename: 'FormElement',
        title: 'Author names',
        id: 'd76e5b3c-eeaa-4168-9318-95d43a31e3e4',
        component: 'AuthorsInput',
        name: 'submission.$authors',
      },
      {
        __typename: 'FormElement',
        title: 'Topics',
        id: '62ca72ad-04b0-41fc-85d1-415469d7e895',
        component: 'CheckboxGroup',
        name: 'submission.topics',
        options: [
          {
            __typename: 'FormElementOption',
            id: '2323b6d1-8223-45e8-a0fc-1044a1e39d37',
            label: 'Neuropsychology ',
            value: 'Neuropsychology ',
          },
          {
            __typename: 'FormElementOption',
            id: 'ac7cafca-c5c8-4940-9f2f-014d18660e90',
            label: 'Topic 2',
            value: 'Topic 2',
          },
          {
            __typename: 'FormElementOption',
            id: '93c88240-9c2b-4c23-9301-23ed94ef61d7',
            label: 'Topic 3',
            value: 'Topic 3',
          },
        ],
      },
      {
        __typename: 'FormElement',
        title: 'DOI',
        id: '1c2e9325-3fa8-41f3-8607-180eb8a25aa3',
        component: 'TextField',
        name: 'submission.$doi',
        doiValidation: 'true',
        placeholder: "Enter the manuscript's DOI",
      },
      {
        __typename: 'FormElement',
        title: 'Abstract',
        shortDescription: 'Abstract',
        id: 'd80b2c88-6144-4003-b671-63990b9b2793',
        component: 'AbstractEditor',
        name: 'submission.$abstract',
        description: '<p>Please provide a short summary of your submission</p>',
        placeholder: 'Input your abstract...',
      },
      {
        __typename: 'FormElement',
        title: 'Author correspondence ',
        id: '7f5aa395-3486-4067-b636-ae204d472c16',
        component: 'TextField',
        name: 'submission.AuthorCorrespondence',
      },
      {
        __typename: 'FormElement',
        title: 'Cover letter',
        id: '347dc171-f008-45ac-8433-ca0711bf213c',
        component: 'AbstractEditor',
        name: 'submission.cover',
        description:
          '<p>Cover letter describing submission, relevant implications, and timely information to consider</p>',
        placeholder: 'Enter your cover letter',
      },
      {
        __typename: 'FormElement',
        title: 'Editors evaluation ',
        id: '14b8da7d-5924-4098-8d1f-e528c7c440b9',
        component: 'TextField',
        name: 'submission.EditorsEvaluation',
      },
      {
        __typename: 'FormElement',
        title: 'Data and Code availability statements',
        id: 'bf2f9b4a-377b-4303-8f51-70d836eb1456',
        component: 'AbstractEditor',
        name: 'submission.datacode',
        placeholder: 'Enter your data and code availability statement',
      },
      {
        __typename: 'FormElement',
        title: 'Competing interests',
        id: 'fa5e5b75-4b6f-4a2d-9113-c2b4db73ef8a',
        component: 'AbstractEditor',
        name: 'submission.competingInterests',
      },
      {
        __typename: 'FormElement',
        title: 'Funding',
        id: '6bfdc237-814d-4af8-b0f0-064099d679ba',
        component: 'TextField',
        name: 'submission.Funding',
      },
      {
        __typename: 'FormElement',
        title: 'Upload supplementary materials',
        id: 'b769b4d5-f9b3-48d3-a6d5-77bb6a9e95b0',
        component: 'SupplementaryFiles',
        name: 'fileName',
      },
      {
        __typename: 'FormElement',
        title: 'Author contributions ',
        id: 'b127ecb1-4862-4662-a958-3266eb284353',
        component: 'TextField',
        name: 'submission.authorContributions',
      },
      {
        __typename: 'FormElement',
        title: 'Decision letter and author response',
        id: '6342cff7-c57a-4fd9-b91d-c4cf77b4c309',
        component: 'AbstractEditor',
        name: 'submission.DecisionLetter',
      },
      {
        __typename: 'FormElement',
        title: 'References ',
        id: 'e8af0c63-e46f-46a8-bc90-5023fe50a541',
        component: 'AbstractEditor',
        name: 'submission.references',
      },
      {
        __typename: 'FormElement',
        title: 'Reviewing editors name ',
        id: 'ebe75cec-0ba8-4f00-9024-20e77ed94f1c',
        component: 'AuthorsInput',
        name: 'submission.reviewingEditor',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright holder',
        id: '6871680a-2278-40b3-80c6-7de06f21aafb',
        component: 'TextField',
        name: 'submission.copyrightHolder',
        description: '<p class="paragraph">e.g. British Medical Journal </p>',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright statement ',
        id: '1e9ff636-f850-4d20-b079-36af49fa4ad1',
        component: 'TextField',
        name: 'submission.copyrightStatement',
        description:
          '<p class="paragraph">e.g. This article is distributed under the terms of the Creative Commons Attribution License, which permits unrestricted use and redistribution provided that the original author and source are credited.</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Copyright year ',
        id: '7617c919-4413-4306-b709-ef78c3110c3f',
        component: 'TextField',
        name: 'submission.copyrightYear',
        description: '<p class="paragraph">e.g. 2022</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date received ',
        id: '6deaacc6-759a-4a68-b494-c38c664bb665',
        component: 'TextField',
        name: 'submission.dateReceived',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date accepted',
        id: '8b858adc-5f65-4385-9f79-5c5af1f67bd5',
        component: 'TextField',
        name: 'submission.dateAccepted',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
      {
        __typename: 'FormElement',
        title: 'Date published ',
        id: 'f6e46890-4b96-4c90-ab48-b4fc5abb9b40',
        component: 'TextField',
        name: 'submission.datePublished',
        description:
          '<p class="paragraph">preferred format: DD.MM.YYYY e.g. 07.01.2021</p>',
      },
    ],
  },
  versionId: 'a358cf5a-fa07-4622-8544-f507974aefc5',
  confirming: false,
  match: {
    path: '/kotahi/versions/:version/submit',
    url: '/kotahi/versions/a358cf5a-fa07-4622-8544-f507974aefc5/submit',
    isExact: true,
    params: {
      version: 'a358cf5a-fa07-4622-8544-f507974aefc5',
    },
  },
  manuscript: {
    __typename: 'Manuscript',
    id: 'a358cf5a-fa07-4622-8544-f507974aefc5',
    shortId: 10,
    created: '2022-04-11T12:15:11.436Z',
    files: [],
    reviews: [],
    teams: [
      {
        __typename: 'Team',
        id: '9be4732b-fe11-4eed-bf91-a586ec3b2dc6',
        role: 'author',
        members: [
          {
            __typename: 'TeamMember',
            id: '6e4c093a-9e9c-459c-9de1-74827326eb64',
            user: {
              __typename: 'User',
              id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
              username: 'Pankaj Kandpal',
            },
          },
        ],
      },
    ],
    decision: '',
    status: 'new',
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: 'a358cf5a-fa07-4622-8544-f507974aefc5',
      source: null,
      history: null,
    },
    authors: null,
    submission:
      '{"$doi":"","cover":"","$title":"New submission 11/04/2022, 17:45:11","topics":[],"Funding":"","$abstract":"","datacode":"","objectType":"","references":"","$authors":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
    manuscriptVersions: [],
    channels: [
      {
        __typename: 'Channel',
        id: 'c80f01c1-c07d-4cae-acf6-5841c637ab2d',
        type: 'all',
        topic: 'Manuscript discussion',
      },
      {
        __typename: 'Channel',
        id: '2df5821b-ec12-48d7-9cfe-545766bb3aab',
        type: 'editorial',
        topic: 'Editorial discussion',
      },
    ],
    formFieldsToPublish: [],
  },
  currentUser: {
    id: '1228b2a9-e125-4e44-be44-d02c2d1ad2eb',
    username: 'Some User',
  },
}

EmptySubmissionForm.args = {
  ...emptyFormProps,
  figmaEmbedLink:
    'https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1385%253A14',
}

export default {
  title: 'Submit/ResearchObjectForm',
  component: SubmissionForm,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FuDxsjgDWxjiof0qSNFLelr%2FKotahi-storybook%3Fnode-id%3D1225%253A3" />
      ),
    },
  },
  argTypes: {},
}

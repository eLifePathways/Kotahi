import { JournalProvider } from '../../app/components/xpub-journal'
import { XpubProvider } from '../../app/components/xpub-with-context/src'
import DesignEmbed from '../common/utils'
import journal from '../../config/journal'
import ReviewLayout from '../../app/components/component-review/src/components/review/ReviewLayout'

export const Base = args => (
  <XpubProvider>
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

        <ReviewLayout {...args} />
      </>
    </JournalProvider>
  </XpubProvider>
)

const baseProps = {
  channelId: '0ffe8c3d-55e8-4296-a523-3fc6decc910f',
  channels: [
    {
      id: '0ffe8c3d-55e8-4296-a523-3fc6decc910f',
      name: 'Discussion with editorial team',
      type: 'editorial',
    },
  ],
  currentUser: {
    __typename: 'User',
    id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
    profilePicture: '/profiles/default_avatar.svg',
    username: 'Han Solo',
    globalRoles: [],
    groupRoles: ['user'],
    email: 'hansolo@gmail.com',
    recentTab: 'reviews',
    preferredLanguage: 'en-US',
    defaultIdentity: {
      __typename: 'Identity',
      identifier: '0000-0002-1203-5003',
      email: null,
      type: 'orcid',
      aff: '',
      id: 'f7ff6070-ee2d-4401-a958-b8055210cb2a',
    },
    isOnline: true,
    teams: [
      {
        __typename: 'Team',
        id: '93e4e02d-15a9-4495-ae2b-7572d03ab598',
        objectId: 'df07cbf3-87dc-496b-9ce1-974c452b6d88',
        objectType: 'Group',
        members: [
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '201fbb87-cc14-456e-9baf-bc984b4527c2',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'e8e1489d-41e5-4f56-bafb-f9daf91ca910',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '0589f676-a018-4974-9f32-859bcd5ee0b8',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '25e11649-dc98-4fb2-bfe3-d555758929f1',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '8802718e-9b10-4920-8014-240b6dcb7fdc',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '646277da-3bde-415f-8102-c751d0557144',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '1c224005-88f7-4335-a849-b95703e738bf',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '65cb3a22-5319-4c27-8617-2b12b4959545',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'fcbecc85-1201-4646-8d51-6604587e88aa',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'cb7c49ce-c787-4d75-88b3-6094c52ca5e5',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '2517cc9c-261b-4c8a-a4bb-7ba5fb3f5629',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '08973298-7617-4041-98b7-1354f962760a',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'ed9b17c2-68b7-4924-a8b4-78879c914c76',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '294af389-447a-4ca5-abb6-993d9f95b5de',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '519b8949-c078-4324-a9e0-e8d1092f1ff2',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'b048db05-1665-4993-b917-875aac7d3955',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'dd7e97bd-6d74-46d9-a8cc-3339858f3f6e',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '50da8083-5924-44f9-960d-73f1333183ab',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '48cc0c4f-1696-43f8-aaa9-fc8d1d810ad6',
        objectId: 'fe163028-9018-4b1c-a5d8-589af43ca59e',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'accepted',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: 'b460225a-1ea9-4522-97e1-1bdc4623ed6e',
        objectId: '21a4bfc2-ed32-4f8f-b8bc-af41dd90fcf5',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '5c0bf429-8d7a-4637-9b63-2537d811423b',
        objectId: '39d0ffc6-38c4-4b2d-98a7-788ab4c4f875',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'inProgress',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: 'ce101c09-1800-4af6-af36-8e0af46aea82',
        objectId: 'eadad4aa-707d-474a-adc2-899b577867c9',
        objectType: 'Group',
        members: [
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: null,
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '1962cf88-cb9f-450f-9e49-c39b63d3c9f1',
        objectId: 'ac248f80-4098-41d1-9134-372d758b60e8',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'inProgress',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: 'c6d4d182-3329-478d-9053-3b4338e7512e',
        objectId: '9a6a8494-4dd2-49b8-a24f-9aa0b5f9787e',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '2696466a-d514-4b4a-b996-31d16cd37d56',
        objectId: '5f9a457c-34e7-4ed3-a607-cf9ad7fc74df',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'inProgress',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '2f111f7c-82e2-4821-a3c7-fdb5478580f8',
        objectId: 'b730ae50-a3bd-48ee-a173-cfa983974303',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '70db9e64-5154-4a44-bf7d-aa4b35090655',
        objectId: 'c52d138d-c1d8-42a3-b8c7-8da9e6bbf89b',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: 'ef173a14-94ea-46a0-b975-910c7bb03f44',
        objectId: 'd67afd79-937b-4cfa-9926-17c7447eb345',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '2c90d3ab-e212-4505-bd7d-27f1fe679493',
        objectId: 'bb656664-69a5-4a1f-bd63-4ef9c3e2a962',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '14c1c199-286a-4b3c-ae1a-cf25d576b930',
        objectId: 'ce95f47a-5e5a-44f8-a9f2-8fa9697e661e',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '5b3710b9-5196-4ccf-9aa8-63dcf07da078',
        objectId: '2c899708-eb37-4d16-b9b1-91377bac9acb',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'inProgress',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: 'af2a0065-5843-4284-aa55-d85622e05784',
        objectId: 'e9994986-1f65-41ea-8c45-9846b0c513a5',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '10ab6677-957b-4a4a-80c7-42765e08d4af',
        objectId: 'c3f7422e-2cf0-4041-ade7-d24e7c153b1d',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '4c90529f-15f9-4874-8397-f1591faef8db',
        objectId: 'a87992a9-9f80-4bd8-b77e-d2409af5ebfd',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '746892a3-6866-489b-84f1-1d61cf42f7b0',
        objectId: 'a87992a9-9f80-4bd8-b77e-d2409af5ebfd',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'inProgress',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '9e50fd53-14e2-439e-94f2-78355ee3d864',
        objectId: '72ec5a07-90f3-4102-adbe-60a1c10397b8',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '9d25ccb6-65a1-41d1-a5ed-63a56bf4f813',
        objectId: '419467f2-792f-4056-a0fb-4ffff26e7e87',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '288e2a3b-c373-46f8-b129-828a48489b2d',
        objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '11ce10aa-144e-4e4d-97ef-1f0fcb8dc15e',
        objectId: '9e9f45ee-d487-427b-9dfd-57565a66df5c',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'invited',
            user: {
              __typename: 'User',
              id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
            },
          },
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
      {
        __typename: 'Team',
        id: '3c69e47e-4a21-41c1-a14b-88f42ba746a4',
        objectId: '33ab269d-a3d5-428f-8f29-b87239058856',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            status: 'completed',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
            },
          },
        ],
      },
    ],
  },
  manuscript: {
    __typename: 'Manuscript',
    parentId: null,
    id: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
    shortId: 10268,
    created: '2023-12-12T05:27:38.536Z',
    files: [
      {
        __typename: 'File',
        id: '4f3e1e62-6882-421a-929b-55c07bebd24d',
        created: '2023-12-12T05:27:38.695Z',
        updated: '2023-12-12T05:27:38.695Z',
        name: 'ManuscriptTemplate.docx',
        tags: ['manuscript'],
        storedObjects: [
          {
            __typename: 'StoredObject',
            key: '',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/dd68e2661c85.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=1b6060b92b30d0701ca99b7e1e6aa23638052bfb89b0ee494f1bf7bd0c29b1cb&X-Amz-SignedHeaders=host',
          },
        ],
      },
      {
        __typename: 'File',
        id: '557f39fc-5033-4aa8-960d-48b3a3435fdd',
        created: '2023-12-12T05:27:39.328Z',
        updated: '2023-12-12T05:27:39.328Z',
        name: 'Image1.png',
        tags: ['manuscriptImage'],
        storedObjects: [
          {
            __typename: 'StoredObject',
            key: '',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/9839b589f8de.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=25bd9848d759b96106d4d0744fc8a489c640604b5f597931f34fca9f8ad1abc7&X-Amz-SignedHeaders=host',
          },
          {
            __typename: 'StoredObject',
            key: '',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/9839b589f8de_medium.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=954fea9954244f34877e04720bb5fbf6f1815d3f8d05692951d6badd7e412c32&X-Amz-SignedHeaders=host',
          },
          {
            __typename: 'StoredObject',
            key: '',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/9839b589f8de_small.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=80927573160519df8508d035960d347bf7bb3b4ff0ecc3985d86000bb936fd49&X-Amz-SignedHeaders=host',
          },
        ],
      },
      {
        __typename: 'File',
        id: '3152d5bb-ebee-4411-9a21-7d273062d936',
        created: '2023-12-12T05:34:11.382Z',
        updated: '2023-12-12T05:34:11.382Z',
        name: 'Sample_Manuscript.PDF',
        tags: ['review'],
        storedObjects: [
          {
            __typename: 'StoredObject',
            key: '94c77e859199.PDF',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/94c77e859199.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=088cc84f7f8a109fcd6d2760080e82e4191ded44ba9e0d2be0998e7b60eaebd1&X-Amz-SignedHeaders=host',
          },
        ],
      },
      {
        __typename: 'File',
        id: '815d6da7-129f-4318-af1a-724f5c765228',
        created: '2023-12-12T05:35:46.384Z',
        updated: '2023-12-12T05:35:46.384Z',
        name: 'Sample_Manuscript.PDF',
        tags: ['review'],
        storedObjects: [
          {
            __typename: 'StoredObject',
            key: '4b72c0928a65.PDF',
            mimetype: '',
            url: 'http://filehosting:9000/uploads/4b72c0928a65.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=a82e41ef7f3f557ca720e209b1a7386b32adc157efd6c539078d006914c38da5&X-Amz-SignedHeaders=host',
          },
        ],
      },
    ],
    reviews: [
      {
        __typename: 'Review',
        id: 'bf894ad0-937f-45b4-8fc8-d496af21dbd2',
        created: '2023-12-12T05:33:18.838Z',
        updated: '2023-12-12T05:33:18.838Z',
        jsonData:
          '{"files":[{"type":"file","id":"3152d5bb-ebee-4411-9a21-7d273062d936","created":"2023-12-12T05:34:11.382Z","updated":"2023-12-12T05:34:11.382Z","name":"Sample_Manuscript.PDF","storedObjects":[{"id":"4f2d860e-532f-4d19-a0a8-74907ebe826a","key":"94c77e859199.PDF","size":12387,"type":"original","mimetype":"","extension":"PDF","url":"http://filehosting:9000/uploads/94c77e859199.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=088cc84f7f8a109fcd6d2760080e82e4191ded44ba9e0d2be0998e7b60eaebd1&X-Amz-SignedHeaders=host"}],"tags":["review"],"referenceId":null,"objectId":"bb68cd72-a1e5-41d4-b494-d96bddd37ef7","alt":null,"uploadStatus":null,"caption":null}],"comment":"<p class=\\"paragraph\\">Test message</p>","verdict":"accept","confidentialComment":"<p class=\\"paragraph\\">Testing comment</p>"}',
        isDecision: false,
        isHiddenReviewerName: true,
        canBePublishedPublicly: false,
        isSharedWithCurrentUser: true,
        user: {
          __typename: 'User',
          id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
          username: 'Han Solo',
          defaultIdentity: {
            __typename: 'Identity',
            id: 'f7ff6070-ee2d-4401-a958-b8055210cb2a',
            identifier: '0000-0002-1203-5003',
          },
        },
      },
      {
        __typename: 'Review',
        id: '2acf8be2-2142-4e11-af63-93d52b7f5582',
        created: '2023-12-12T05:35:05.808Z',
        updated: '2023-12-12T05:35:05.808Z',
        jsonData:
          '{"files":[{"type":"file","id":"815d6da7-129f-4318-af1a-724f5c765228","created":"2023-12-12T05:35:46.384Z","updated":"2023-12-12T05:35:46.384Z","name":"Sample_Manuscript.PDF","storedObjects":[{"id":"22a836f9-d5c7-484a-af6c-d0672a823298","key":"4b72c0928a65.PDF","size":12387,"type":"original","mimetype":"","extension":"PDF","url":"http://filehosting:9000/uploads/4b72c0928a65.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=a82e41ef7f3f557ca720e209b1a7386b32adc157efd6c539078d006914c38da5&X-Amz-SignedHeaders=host"}],"tags":["review"],"referenceId":null,"objectId":"bb68cd72-a1e5-41d4-b494-d96bddd37ef7","alt":null,"uploadStatus":null,"caption":null}],"comment":"<p class=\\"paragraph\\">Nice work done</p>","verdict":"accept","confidentialComment":"<p class=\\"paragraph\\">Good work</p>"}',
        isDecision: false,
        isHiddenReviewerName: true,
        canBePublishedPublicly: false,
        isSharedWithCurrentUser: true,
        user: {
          __typename: 'User',
          id: '275ee40c-f031-4d58-9659-975cc3770207',
          username: 'Leia Organa',
          defaultIdentity: {
            __typename: 'Identity',
            id: '10451e35-363c-4687-b35a-2fc15fceb6ea',
            identifier: '0009-0008-8477-7883',
          },
        },
      },
      {
        __typename: 'Review',
        id: '8af1662b-8c26-46d2-ac1c-8feef71052ba',
        created: '2023-12-12T05:32:02.552Z',
        updated: '2023-12-12T05:32:02.552Z',
        jsonData:
          '{"comment":"<p class=\\"paragraph\\">Testing</p>","verdict":"accept"}',
        isDecision: true,
        isHiddenReviewerName: false,
        canBePublishedPublicly: false,
        isSharedWithCurrentUser: true,
        user: {
          __typename: 'User',
          id: '275ee40c-f031-4d58-9659-975cc3770207',
          username: 'Leia Organa',
          defaultIdentity: {
            __typename: 'Identity',
            id: '10451e35-363c-4687-b35a-2fc15fceb6ea',
            identifier: '0009-0008-8477-7883',
          },
        },
      },
    ],
    decision: 'accepted',
    teams: [
      {
        __typename: 'Team',
        id: '6941b73f-675e-45e2-85c4-5a9eb3320de9',
        name: 'Author',
        role: 'author',
        objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            id: '61e10da2-7474-434a-ad3f-4f444d573fb9',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
              username: 'Leia Organa',
            },
            status: null,
            isShared: null,
          },
        ],
      },
      {
        __typename: 'Team',
        id: '288e2a3b-c373-46f8-b129-828a48489b2d',
        name: 'Reviewers',
        role: 'reviewer',
        objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
        objectType: 'manuscript',
        members: [
          {
            __typename: 'TeamMember',
            id: 'd2c6a3a8-9e92-43ef-accb-96728a444af2',
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              username: 'Han Solo',
            },
            status: 'completed',
            isShared: true,
          },
          {
            __typename: 'TeamMember',
            id: '1ee470a7-2ab2-4bd3-ad97-e653bfcde867',
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
              username: 'Leia Organa',
            },
            status: 'completed',
            isShared: true,
          },
        ],
      },
    ],
    status: 'accepted',
    meta: {
      __typename: 'ManuscriptMeta',
      manuscriptId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
      title:
        'Unraveling the Mysteries of Quantum Cognition: A Multidisciplinary Exploration',
      source:
        '<html><head></head><body><h1>Paper Title (Use style: Paper title)</h1>\n\n<h3>First Author<sup>1</sup>, Second Author<sup>2</sup>, Third Author<sup>3</sup></h3>\n<h4><sup>1</sup>First Author Affiliation &amp; Address</h4>\n<h4><sup>2</sup>Second Author Affiliation &amp; Address</h4>\n<h4><sup>3</sup>Third Author Affiliation &amp; Address</h4>\n\n<h4>ABSTRACT</h4>\n<p class="paragraph">This document file is a live template. The various components of your paper [title, text, heads, etc.] are exactly defined on the style sheet, as illustrated by the portions given in this document. Do not include any special characters, symbols, or math in your title or abstract. The authors must follow the guidelines given in the document for the papers to be published. You can use this document file as both an instruction set and as a template into which you can type your own text</p>\n<h4><em>KEYWORDS:</em> Include at least 5 to 6 keywords or phrases</h4><ol type="none"><li>\n</li><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>INTRODUCTION</em></p></li></ol>\n<p class="paragraph">This template provides all the necessary information to the author regarding the formatting specifications needed for preparing electronic versions of their papers. We ask you to make your manuscript look exactly like this document. The easiest ways to do this is simply downloading the template, and replace (copy-paste) the content with your own material. All manuscripts must be in English. This document includes complete descriptions of the fonts, spacing, and related information for producing your proceedings manuscripts.</p>\n<p class="paragraph">Margins, column widths, line spacing, and type styles are built-in; examples of the type styles are provided throughout this document and are identified in italic type, within parentheses, following the example. <em><em>Please do not re-adjust the margins.</em></em></p><ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Layout</em></p></li></ol>\n<p class="paragraph">An easy way to comply with the conference paper formatting requirements is to use this document as a template and simply type your text into it. Wherever Times is specified, Times Roman or Times New Roman may be used.</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Layout</em></p></li></ol>\n<p class="paragraph">The margins must be set as follows:</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Top = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Bottom = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Left = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Right = 1.7cm</p></li></ol>\n<ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Style</em></p></li></ol>\n<p class="paragraph">All paragraphs must be indented as well as justified, i.e. both left-justified and right-justified.</p><ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Text Font of Entire Document</em></p></li></ol>\n<p class="paragraph">The entire document should be in Times New Roman or Times font. Other font types may be used if needed for special purposes. Type 3 fonts should not be used.</p>\n<p class="paragraph">Recommended font sizes are shown in Table 1.</p><ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Title and Author Details</em></p></li></ol>\n<p class="paragraph">Title must be in 20 points Times New Roman font. Author name must be in 11 points times new roman font. Author affiliation must be in 10 points italic Times new roman. Email address must be in 10 points times new roman font.</p>\n<p class="paragraph">All title and author details must be in single-column format and must be centered. Every word in a title must be capitalized. Email address is compulsory for the corresponding author.</p>\n\n<ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Section Headings</em></p></li></ol>\n<p class="paragraph">No more than three levels of headings should be used. All headings must be in 10pt font. Every word in a heading must be capitalized except for short minor words as listed in Section III-B.</p>\n<p class="paragraph"><em><em>Level–1 Heading</em>:</em> A level–1 heading must be in Small Caps, centered and numbered using uppercase Roman numerals. For example, see heading “III Page Style” of this document. The two level–1 headings which must not be numbered are “Acknowledgment” and “References”.</p>\n<p class="paragraph"><em><em>Level–2 Heading:</em></em> A level–2 heading must be in Italic, left-justified and numbered using an uppercase alphabetic letter followed by a period. For example, see heading “C. Section Headings” above.</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em><em>Level–3 Heading:</em> A level–3 heading must be indented, in Italic and numbered with an Arabic numeral followed by a right parenthesis. The level–3 heading must end with a colon. The body of the level–3 section immediately follows the level–3 heading in the same paragraph. For example, this paragraph begins with a level–3 heading.</em></p></li></ol>\n<h4>Figures and Tables</h4>\n<p class="paragraph">Figures and tables must be centered in the column. Large figures and tables may span across both columns. Any table or figure that takes up more than 1 column width must be positioned either at the top or at the bottom of the page.</p>\n<h4>Figure Captions</h4>\n<p class="paragraph">Figures must be numbered using Arabic numerals. Figure captions must be in 8 pt Regular font. Captions of a single line must be centered whereas multi-line captions must be justified. Captions with figure numbers must be placed after their associated figures</p>\n<figure><img data-original-name="Picture 1" src="http://filehosting:9000/uploads/9839b589f8de_medium.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20231212T054545Z&amp;X-Amz-Expires=86400&amp;X-Amz-Signature=954fea9954244f34877e04720bb5fbf6f1815d3f8d05692951d6badd7e412c32&amp;X-Amz-SignedHeaders=host" data-fileid="557f39fc-5033-4aa8-960d-48b3a3435fdd" alt="Image1.png"></figure>\n<h4>Table Captions</h4>\n<p class="paragraph">Tables must be numbered using uppercase Roman numerals. Table captions must be centred and in 8 pt Regular font with Small Caps. Every word in a table caption must be capitalized except for short minor words as listed in Section III-B. Captions with table numbers must be placed before their associated tables, as shown in Table</p>\n<table><tbody><tr><td>\n<p class="paragraph"><em>Sr. No.</em></p></td><td>\n<p class="paragraph"><em>Heading1</em></p></td><td>\n<p class="paragraph"><em>Heading2</em></p></td><td>\n<p class="paragraph"><em>Heading3</em></p></td><td>\n<p class="paragraph"><em>Heading 4</em></p></td><td>\n<p class="paragraph"><em>Heading5</em></p></td><td>\n<p class="paragraph"><em>Heading 6</em></p></td></tr><tr><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td></tr></tbody></table>\n<h4>Page Numbers, Headers and Footers</h4>\n<p class="paragraph">Page numbers, headers and footers must not be used.</p>\n<h4>Links and Bookmarks</h4>\n<p class="paragraph">All hypertext links and section bookmarks will be removed from papers during the processing of papers for publication. If you need to refer to an Internet email address or URL in your paper, you must type out the address or URL fully in Regular font.</p><ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>References</em></p></li></ol>\n<p class="paragraph">The heading of the References section must not be numbered. All reference items must be in 8 pt font. Please use Regular and Italic styles to distinguish different fields as shown in the References section.Number the reference items consecutively in square brackets (e.g. [1]).</p>\n<ol type="1"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Ding, W. and Marchionini, G. 1997 A Study on Video Browsing Strategies. Technical Report. University of Maryland at College Park.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Tavel, P. 2007 Modeling and Simulation Design. AK Peters Ltd.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Sannella, M.&nbsp;J. 1994 Constraint Satisfaction and Debugging for Interactive User Interfaces. Doctoral Thesis. UMI Order Number: UMI Order No. GAX95–09398., University of Washington.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Brown, L.&nbsp;D., Hua, H., and Gao, C. 2003. A widget framework for augmented interaction in SCAPE.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Y.&nbsp;T. Yu, M.&nbsp;F. Lau, “A comparison of MC/DC, MUMCUT and several other coverage criteria for logical decisions”, Journal of Systems and Software, 2005, in press.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Spector, A.&nbsp;Z. 1989. Achieving application requirements. In Distributed Systems, S. Mullende</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Forman, G. 2003. An extensive empirical study of feature selection metrics for text classification. J. Mach. Learn. Res. 3 (Mar. 2003), 1289–1305.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Fröhlich, B. and Plate, J. 2000. The cubic mouse: a new device for three-dimensional input. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Bowman, M., Debray, S.&nbsp;K., and Peterson, L.&nbsp;L. 1993. Reasoning about naming systems..</p></li><li>\n</li></ol>\n</body></html>',
      abstract: null,
      history: null,
    },
    submission:
      '{"doi":"DOI: 10.1234/abcd.5678","link":"Testing link","title":"","labels":"readyToPublish","topics":["diagnostics","epidemiology"],"journal":"Journal of Cognitive Sciences","ourTake":"<p class=\\"paragraph\\">In this manuscript, we provide a comprehensive analysis of Quantum Cognition, emphasizing the significance of embracing novel perspectives in the intersection of quantum theory and cognitive processes. Our take centers on fostering a deeper understanding of quantum phenomena\'s potential impact on human cognition and decision-making.</p>","abstract":"<p class=\\"paragraph\\">This manuscript delves into the uncharted territories of Quantum Cognition, aiming to shed light on innovative paradigms and contribute to the evolving landscape of research. The study employs a multidisciplinary approach, synthesizing insights from cognitive psychology, quantum theory, and computational modeling to address key questions in the field.</p>","editDate":"2023-12-12","keywords":"Quantum cognition Cognitive processes Quantum-inspired modeling Interdisciplinary research","firstAuthor":"Dr. Allison Quantum Explorer","limitations":"<p class=\\"paragraph\\"><strong>Sample Size:</strong> The study acknowledges limitations in sample size, which may impact the generalizability of the findings.</p><ul><li><p class=\\"paragraph\\"><strong>Complexity of Quantum Models:</strong> The intricacies of quantum-inspired models may pose challenges in interpretation and application.</p></li><li><p class=\\"paragraph\\"><strong>External Validity:</strong> Generalizing findings to real-world scenarios beyond controlled experiments may be limited.</p></li></ul>","mainFindings":"<p class=\\"paragraph\\">Quantum-like interference patterns in decision-making processes.</p><ol><li><p class=\\"paragraph\\">Emergence of entangled cognitive states in problem-solving.</p></li><li><p class=\\"paragraph\\">The role of contextuality in shaping cognitive preferences.</p></li></ol>","datePublished":"December 12, 2023","reviewCreator":" Dr. Anakin Skywalker","studyStrengths":"<p class=\\"paragraph\\"><strong>Robust Methodology:</strong> Our research employs a rigorous methodology, incorporating quantum-inspired models and experimental validations to ensure the reliability and validity of our findings.</p><ul><li><p class=\\"paragraph\\"><strong>Interdisciplinary Insights:</strong> We bridge disciplinary boundaries, offering a holistic perspective that enriches the current discourse in Quantum Cognition.</p></li><li><p class=\\"paragraph\\"><strong>Collaborative Approach:</strong> This study benefits from a collaborative effort, bringing together experts from cognitive science, physics, and computer science to enrich the research landscape.</p></li></ul>"}',
    manuscriptVersions: [],
    channels: [
      {
        __typename: 'Channel',
        id: 'b48c56a8-a8f3-4cc6-8d34-73ecb954e5ab',
        type: 'all',
        topic: 'Manuscript discussion',
      },
      {
        __typename: 'Channel',
        id: '0ffe8c3d-55e8-4296-a523-3fc6decc910f',
        type: 'editorial',
        topic: 'Editorial discussion',
      },
    ],
  },
  reviewForm: {
    __typename: 'FormStructure',
    name: 'Yes this is the review form',
    description:
      '<p class="paragraph">By completing this review, you agree that you do not have any conflict of interests to declare. For any questions about what constitutes a conflict of interest, contact the administrator.</p>',
    haspopup: 'true',
    popuptitle: 'Confirm your review',
    popupdescription:
      '<p class="paragraph">By submitting this review, you agree that you do not have any conflict of interests to declare. For any questions about what constitutes a conflict of interest, contact the administrator.</p>',
    children: [
      {
        __typename: 'FormElement',
        title: 'Comments to the Author',
        shortDescription: null,
        id: '1880448f-827a-422a-8ed7-c00f8ce9ccae',
        component: 'AbstractEditor',
        name: 'comment',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: 'Enter your review...',
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '332253be-dc19-47a8-9bfb-c32fa3fc9b43',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: ' ',
        shortDescription: 'Files',
        id: '4e0ee4a6-57bc-4284-957a-f3e17ac4a24d',
        component: 'SupplementaryFiles',
        name: 'files',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: null,
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Confidential comments to the editor (optional)',
        shortDescription: 'Confidential comments',
        id: '2a1eab32-3e78-49e1-b0e5-24104a39a06a',
        component: 'AbstractEditor',
        name: 'confidentialComment',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: 'Enter a confidential note to the editor (optional)...',
        parse: null,
        format: null,
        options: null,
        validate: null,
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: ' ',
        shortDescription: 'Confidential files',
        id: '21b5de2c-10fd-48cb-a00a-ab2c96b1c242',
        component: 'SupplementaryFiles',
        name: 'confidentialFiles',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: null,
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Recommendation',
        shortDescription: null,
        id: '257d6be0-0832-41fc-b6d2-b1f096342bc2',
        component: 'RadioGroup',
        name: 'verdict',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: [
          {
            __typename: 'FormElementOption',
            id: 'da8a08bd-d035-400e-856a-f2c6f8040c27',
            label: 'Accept',
            labelColor: '#048802',
            value: 'accept',
          },
          {
            __typename: 'FormElementOption',
            id: 'da75afd9-aeac-4d24-8f5e-8ed00d233543',
            label: 'Revise',
            labelColor: '#ebc400',
            value: 'revise',
          },
          {
            __typename: 'FormElementOption',
            id: 'a254f0c1-25e5-45bb-8a8e-8251d2c27f8c',
            label: 'Reject',
            labelColor: '#ea412e',
            value: 'reject',
          },
        ],
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'd970099e-b05e-4fae-891f-1a81d6f46b65',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
    ],
  },
  submissionForm: {
    __typename: 'FormStructure',
    name: 'Research Object Submission Form',
    description:
      '<p>Aperture is now accepting Research Object Submissions. Please fill out the form below to complete your submission.</p>',
    haspopup: 'true',
    popuptitle:
      'By submitting the manuscript, you agree to the following statements.',
    popupdescription:
      '<p>The corresponding author confirms that all co-authors are included, and that everyone listed as a co-author agrees to that role and all the following requirements and acknowledgements.</p><p></p><p>The submission represents original work and that sources are given proper attribution. The journal employs CrossCheck to compare submissions against a large and growing database of published scholarly content. If in the judgment of a senior editor a submission is genuinely suspected of plagiarism, it will be returned to the author(s) with a request for explanation.</p><p></p><p>The research was conducted in accordance with ethical principles.</p><p></p><p>There is a Data Accessibility Statement, containing information about the location of open data and materials, in the manuscript.</p><p></p><p>A conflict of interest statement is present in the manuscript, even if to state no conflicts of interest.</p>',
    children: [
      {
        __typename: 'FormElement',
        title: 'Title',
        shortDescription: null,
        id: '8afe555d-30e5-4bc8-9826-6a9dc5d34760',
        component: 'TextField',
        name: 'meta.title',
        description: '<p></p>',
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: "Enter the manuscript's title",
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '14b32182-e4a5-4a99-bb23-b673b500b521',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'DOI',
        shortDescription: null,
        id: '29512053-bad0-43cd-ad4f-1ec689c72a63',
        component: 'TextField',
        name: 'submission.$doi',
        description: '<p></p>',
        doiValidation: 'false',
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Abstract',
        shortDescription: null,
        id: 'e93b5e84-a049-4a0f-9a7a-b573aea4f905',
        component: 'AbstractEditor',
        name: 'submission.$abstract',
        description: '<p></p>',
        doiValidation: 'false',
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '090dbe42-e86d-11eb-9a03-0242ac130003',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'First Author',
        shortDescription: null,
        id: '49a42019-748a-4fd1-a0e3-210a43ce8225',
        component: 'TextField',
        name: 'submission.firstAuthor',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'dbbabc17-c2e2-476d-901a-c6bae38c8fe6',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Date Published',
        shortDescription: null,
        id: '43fcd173-40fd-411c-a89c-6bdd958bed70',
        component: 'TextField',
        name: 'submission.datePublished',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '659e9a15-df54-48a9-9755-539b94a198c1',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Link',
        shortDescription: null,
        id: 'f3228a30-e87c-11eb-9a03-0242ac130003',
        component: 'TextField',
        name: 'submission.$sourceUri',
        description: '<p></p>',
        doiValidation: 'false',
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'fbac4704-e87c-11eb-9a03-0242ac130003',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Topics',
        shortDescription: null,
        id: 'fef9af15-9d7b-4164-bb5b-9277b6f96704',
        component: 'CheckboxGroup',
        name: 'submission.topics',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: [
          {
            __typename: 'FormElementOption',
            id: '21703cd4-5a73-4701-b828-6fc3bf913908',
            label: 'ecology and spillover',
            labelColor: null,
            value: 'ecologyAndSpillover',
          },
          {
            __typename: 'FormElementOption',
            id: '6a3a41ea-c12d-48a5-8f00-d9eec0980b17',
            label: 'vaccines',
            labelColor: null,
            value: 'vaccines',
          },
          {
            __typename: 'FormElementOption',
            id: 'c1caf4b9-e9b7-42e2-8724-28a72abdd179',
            label: 'non-pharmaceutical and pharmaceutical interventions',
            labelColor: null,
            value: 'nonPharmaceuticalAndPharmaceuticalInterventions',
          },
          {
            __typename: 'FormElementOption',
            id: '4c12f2bb-e90a-41d2-a76b-1f2f98b89ae5',
            label: 'epidemiology',
            labelColor: null,
            value: 'epidemiology',
          },
          {
            __typename: 'FormElementOption',
            id: '1896c629-5559-447f-be12-e74dbf2a4a76',
            label: 'diagnostics',
            labelColor: null,
            value: 'diagnostics',
          },
          {
            __typename: 'FormElementOption',
            id: '3ef38a6c-de1d-49de-8e48-b548aa08cfd7',
            label: 'modeling',
            labelColor: null,
            value: 'modeling',
          },
          {
            __typename: 'FormElementOption',
            id: 'd39b8a6e-4968-48b5-bad4-f7c5ec5269c0',
            label: 'clinical presentation',
            labelColor: null,
            value: 'clinicalPresentation',
          },
          {
            __typename: 'FormElementOption',
            id: '1d5428c0-b2ce-4d90-90c6-e8a6a6c53dbc',
            label: 'prognostic risk factors',
            labelColor: null,
            value: 'prognosticRiskFactors',
          },
        ],
        validate: [],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Our take',
        shortDescription: null,
        id: '13e673b4-0a25-4a02-92e6-e2a3a8b59daf',
        component: 'AbstractEditor',
        name: 'submission.ourTake',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '2d5e8deb-e03c-4f5c-9a23-f376321b040f',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Main findings',
        shortDescription: null,
        id: '421aab67-569f-4539-8bc6-97376c64538f',
        component: 'AbstractEditor',
        name: 'submission.mainFindings',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'c07bc691-f618-43c7-953d-99ac9081096e',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Study strengths',
        shortDescription: null,
        id: '4209cfa4-95de-48d4-ae3f-c98b29a9a847',
        component: 'AbstractEditor',
        name: 'submission.studyStrengths',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '56c4bdee-8846-4abc-b125-181da32939b3',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Limitations',
        shortDescription: null,
        id: '6531975d-1e8e-4bf1-831e-61e7b52a912e',
        component: 'AbstractEditor',
        name: 'submission.limitations',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'd54b8471-0897-4fc0-8d49-9e0fcf8b073b',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Keywords',
        shortDescription: null,
        id: '2c4fb5cd-1e88-434c-b28a-7837c57c89ab',
        component: 'TextField',
        name: 'submission.keywords',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: '4e546ce4-e86d-11eb-9a03-0242ac130003',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Journal',
        shortDescription: null,
        id: '150d401e-0e1c-4122-a661-26516a8e6838',
        component: 'TextField',
        name: 'submission.journal',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Edit date',
        shortDescription: null,
        id: 'f60c6272-bd21-466b-9943-2837f7b2fcf5',
        component: 'TextField',
        name: 'submission.editDate',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: null,
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Labels',
        shortDescription: null,
        id: 'a94dd0b8-99a0-4555-9e59-0895fafa464e',
        component: 'Select',
        name: 'submission.labels',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: [
          {
            __typename: 'FormElementOption',
            id: '90eeb071-b99c-482c-9b62-3ed3e98bd6e8',
            label: 'Ready to evaluate',
            labelColor: null,
            value: 'readyToEvaluate',
          },
          {
            __typename: 'FormElementOption',
            id: 'e10b7c15-7c3d-4eb6-b490-6194003a87d8',
            label: 'Evaluated',
            labelColor: null,
            value: 'evaluated',
          },
          {
            __typename: 'FormElementOption',
            id: '939e2f13-19ad-4c28-8a6a-142a97ddbbd2',
            label: 'Ready to publish',
            labelColor: null,
            value: 'readyToPublish',
          },
        ],
        validate: [],
        validateValue: null,
        hideFromReviewers: null,
      },
      {
        __typename: 'FormElement',
        title: 'Review creator',
        shortDescription: null,
        id: '12a0d30b-e91a-434d-9985-01820f48fdc4',
        component: 'TextField',
        name: 'submission.reviewCreator',
        description: null,
        doiValidation: null,
        doiUniqueSuffixValidation: null,
        placeholder: null,
        parse: null,
        format: null,
        options: null,
        validate: [
          {
            __typename: 'FormElementOption',
            id: 'b1d25468-eb0c-498e-9aaf-ad18b756a4fd',
            label: 'Required',
            value: 'required',
          },
        ],
        validateValue: null,
        hideFromReviewers: null,
      },
    ],
  },
  versions: [
    {
      label: 'Current version (1)',
      manuscript: {
        __typename: 'Manuscript',
        parentId: null,
        id: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
        shortId: 10268,
        created: '2023-12-12T05:27:38.536Z',
        files: [
          {
            __typename: 'File',
            id: '4f3e1e62-6882-421a-929b-55c07bebd24d',
            created: '2023-12-12T05:27:38.695Z',
            updated: '2023-12-12T05:27:38.695Z',
            name: 'ManuscriptTemplate.docx',
            tags: ['manuscript'],
            storedObjects: [
              {
                __typename: 'StoredObject',
                key: 'dd68e2661c85.docx',
                mimetype: '',
                url: 'http://filehosting:9000/uploads/dd68e2661c85.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=1b6060b92b30d0701ca99b7e1e6aa23638052bfb89b0ee494f1bf7bd0c29b1cb&X-Amz-SignedHeaders=host',
              },
            ],
          },
          {
            __typename: 'File',
            id: '557f39fc-5033-4aa8-960d-48b3a3435fdd',
            created: '2023-12-12T05:27:39.328Z',
            updated: '2023-12-12T05:27:39.328Z',
            name: 'Image1.png',
            tags: ['manuscriptImage'],
            storedObjects: [
              {
                __typename: 'StoredObject',
                key: '9839b589f8de.png',
                mimetype: '',
                url: 'http://filehosting:9000/uploads/9839b589f8de.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=25bd9848d759b96106d4d0744fc8a489c640604b5f597931f34fca9f8ad1abc7&X-Amz-SignedHeaders=host',
              },
              {
                __typename: 'StoredObject',
                key: '9839b589f8de_medium.png',
                mimetype: '',
                url: 'http://filehosting:9000/uploads/9839b589f8de_medium.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=954fea9954244f34877e04720bb5fbf6f1815d3f8d05692951d6badd7e412c32&X-Amz-SignedHeaders=host',
              },
              {
                __typename: 'StoredObject',
                key: '9839b589f8de_small.png',
                mimetype: '',
                url: 'http://filehosting:9000/uploads/9839b589f8de_small.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=80927573160519df8508d035960d347bf7bb3b4ff0ecc3985d86000bb936fd49&X-Amz-SignedHeaders=host',
              },
            ],
          },
          {
            __typename: 'File',
            id: '3152d5bb-ebee-4411-9a21-7d273062d936',
            created: '2023-12-12T05:34:11.382Z',
            updated: '2023-12-12T05:34:11.382Z',
            name: 'Sample_Manuscript.PDF',
            tags: ['review'],
            storedObjects: [
              {
                __typename: 'StoredObject',
                key: '94c77e859199.PDF',
                mimetype: '',
                url: 'http://filehosting:9000/uploads/94c77e859199.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=088cc84f7f8a109fcd6d2760080e82e4191ded44ba9e0d2be0998e7b60eaebd1&X-Amz-SignedHeaders=host',
              },
            ],
          },
          {
            __typename: 'File',
            id: '815d6da7-129f-4318-af1a-724f5c765228',
            created: '2023-12-12T05:35:46.384Z',
            updated: '2023-12-12T05:35:46.384Z',
            name: 'Sample_Manuscript.PDF',
            tags: ['review'],
            storedObjects: [
              {
                __typename: 'StoredObject',
                key: '4b72c0928a65.PDF',
                mimetype: 'f',
                url: 'http://filehosting:9000/uploads/4b72c0928a65.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=a82e41ef7f3f557ca720e209b1a7386b32adc157efd6c539078d006914c38da5&X-Amz-SignedHeaders=host',
              },
            ],
          },
        ],
        reviews: [
          {
            __typename: 'Review',
            id: 'bf894ad0-937f-45b4-8fc8-d496af21dbd2',
            created: '2023-12-12T05:33:18.838Z',
            updated: '2023-12-12T05:33:18.838Z',
            jsonData:
              '{"files":[{"type":"file","id":"3152d5bb-ebee-4411-9a21-7d273062d936","created":"2023-12-12T05:34:11.382Z","updated":"2023-12-12T05:34:11.382Z","name":"Sample_Manuscript.PDF","storedObjects":[{"id":"4f2d860e-532f-4d19-a0a8-74907ebe826a","key":"94c77e859199.PDF","size":12387,"type":"original","mimetype":"","extension":"PDF","url":"http://filehosting:9000/uploads/94c77e859199.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=088cc84f7f8a109fcd6d2760080e82e4191ded44ba9e0d2be0998e7b60eaebd1&X-Amz-SignedHeaders=host"}],"tags":["review"],"referenceId":null,"objectId":"bb68cd72-a1e5-41d4-b494-d96bddd37ef7","alt":null,"uploadStatus":null,"caption":null}],"comment":"<p class=\\"paragraph\\">Test message</p>","verdict":"accept","confidentialComment":"<p class=\\"paragraph\\">Testing comment</p>"}',
            isDecision: false,
            isHiddenReviewerName: true,
            canBePublishedPublicly: false,
            isSharedWithCurrentUser: true,
            user: {
              __typename: 'User',
              id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              username: 'Han Solo',
              defaultIdentity: {
                __typename: 'Identity',
                id: 'f7ff6070-ee2d-4401-a958-b8055210cb2a',
                identifier: '0000-0002-1203-5003',
              },
            },
          },
          {
            __typename: 'Review',
            id: '2acf8be2-2142-4e11-af63-93d52b7f5582',
            created: '2023-12-12T05:35:05.808Z',
            updated: '2023-12-12T05:35:05.808Z',
            jsonData:
              '{"files":[{"type":"file","id":"815d6da7-129f-4318-af1a-724f5c765228","created":"2023-12-12T05:35:46.384Z","updated":"2023-12-12T05:35:46.384Z","name":"Sample_Manuscript.PDF","storedObjects":[{"id":"22a836f9-d5c7-484a-af6c-d0672a823298","key":"4b72c0928a65.PDF","size":12387,"type":"original","mimetype":"","extension":"PDF","url":"http://filehosting:9000/uploads/4b72c0928a65.PDF?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20231212T054545Z&X-Amz-Expires=86400&X-Amz-Signature=a82e41ef7f3f557ca720e209b1a7386b32adc157efd6c539078d006914c38da5&X-Amz-SignedHeaders=host"}],"tags":["review"],"referenceId":null,"objectId":"bb68cd72-a1e5-41d4-b494-d96bddd37ef7","alt":null,"uploadStatus":null,"caption":null}],"comment":"<p class=\\"paragraph\\">Nice work done</p>","verdict":"accept","confidentialComment":"<p class=\\"paragraph\\">Good work</p>"}',
            isDecision: false,
            isHiddenReviewerName: true,
            canBePublishedPublicly: false,
            isSharedWithCurrentUser: true,
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
              username: 'Leia Organa',
              defaultIdentity: {
                __typename: 'Identity',
                id: '10451e35-363c-4687-b35a-2fc15fceb6ea',
                identifier: '0009-0008-8477-7883',
              },
            },
          },
          {
            __typename: 'Review',
            id: '8af1662b-8c26-46d2-ac1c-8feef71052ba',
            created: '2023-12-12T05:32:02.552Z',
            updated: '2023-12-12T05:32:02.552Z',
            jsonData:
              '{"comment":"<p class=\\"paragraph\\">Testing</p>","verdict":"accept"}',
            isDecision: true,
            isHiddenReviewerName: false,
            canBePublishedPublicly: false,
            isSharedWithCurrentUser: true,
            user: {
              __typename: 'User',
              id: '275ee40c-f031-4d58-9659-975cc3770207',
              username: 'Leia Organa',
              defaultIdentity: {
                __typename: 'Identity',
                id: '10451e35-363c-4687-b35a-2fc15fceb6ea',
                identifier: '0009-0008-8477-7883',
              },
            },
          },
        ],
        decision: 'accepted',
        teams: [
          {
            __typename: 'Team',
            id: '6941b73f-675e-45e2-85c4-5a9eb3320de9',
            name: 'Author',
            role: 'author',
            objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
            objectType: 'manuscript',
            members: [
              {
                __typename: 'TeamMember',
                id: '61e10da2-7474-434a-ad3f-4f444d573fb9',
                user: {
                  __typename: 'User',
                  id: '275ee40c-f031-4d58-9659-975cc3770207',
                  username: 'Leia Organa',
                },
                status: null,
                isShared: null,
              },
            ],
          },
          {
            __typename: 'Team',
            id: '288e2a3b-c373-46f8-b129-828a48489b2d',
            name: 'Reviewers',
            role: 'reviewer',
            objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
            objectType: 'manuscript',
            members: [
              {
                __typename: 'TeamMember',
                id: 'd2c6a3a8-9e92-43ef-accb-96728a444af2',
                user: {
                  __typename: 'User',
                  id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
                  username: 'Han Solo',
                },
                status: 'completed',
                isShared: true,
              },
              {
                __typename: 'TeamMember',
                id: '1ee470a7-2ab2-4bd3-ad97-e653bfcde867',
                user: {
                  __typename: 'User',
                  id: '275ee40c-f031-4d58-9659-975cc3770207',
                  username: 'Leia Organa',
                },
                status: 'completed',
                isShared: true,
              },
            ],
          },
        ],
        status: 'accepted',
        meta: {
          __typename: 'ManuscriptMeta',
          manuscriptId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
          title:
            'Unraveling the Mysteries of Quantum Cognition: A Multidisciplinary Exploration',
          source:
            '<html><head></head><body><h1>Paper Title (Use style: Paper title)</h1>\n\n<h3>First Author<sup>1</sup>, Second Author<sup>2</sup>, Third Author<sup>3</sup></h3>\n<h4><sup>1</sup>First Author Affiliation &amp; Address</h4>\n<h4><sup>2</sup>Second Author Affiliation &amp; Address</h4>\n<h4><sup>3</sup>Third Author Affiliation &amp; Address</h4>\n\n<h4>ABSTRACT</h4>\n<p class="paragraph">This document file is a live template. The various components of your paper [title, text, heads, etc.] are exactly defined on the style sheet, as illustrated by the portions given in this document. Do not include any special characters, symbols, or math in your title or abstract. The authors must follow the guidelines given in the document for the papers to be published. You can use this document file as both an instruction set and as a template into which you can type your own text</p>\n<h4><em>KEYWORDS:</em> Include at least 5 to 6 keywords or phrases</h4><ol type="none"><li>\n</li><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>INTRODUCTION</em></p></li></ol>\n<p class="paragraph">This template provides all the necessary information to the author regarding the formatting specifications needed for preparing electronic versions of their papers. We ask you to make your manuscript look exactly like this document. The easiest ways to do this is simply downloading the template, and replace (copy-paste) the content with your own material. All manuscripts must be in English. This document includes complete descriptions of the fonts, spacing, and related information for producing your proceedings manuscripts.</p>\n<p class="paragraph">Margins, column widths, line spacing, and type styles are built-in; examples of the type styles are provided throughout this document and are identified in italic type, within parentheses, following the example. <em><em>Please do not re-adjust the margins.</em></em></p><ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Layout</em></p></li></ol>\n<p class="paragraph">An easy way to comply with the conference paper formatting requirements is to use this document as a template and simply type your text into it. Wherever Times is specified, Times Roman or Times New Roman may be used.</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Layout</em></p></li></ol>\n<p class="paragraph">The margins must be set as follows:</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Top = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Bottom = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Left = 1.7cm</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph">Right = 1.7cm</p></li></ol>\n<ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>Page Style</em></p></li></ol>\n<p class="paragraph">All paragraphs must be indented as well as justified, i.e. both left-justified and right-justified.</p><ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Text Font of Entire Document</em></p></li></ol>\n<p class="paragraph">The entire document should be in Times New Roman or Times font. Other font types may be used if needed for special purposes. Type 3 fonts should not be used.</p>\n<p class="paragraph">Recommended font sizes are shown in Table 1.</p><ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Title and Author Details</em></p></li></ol>\n<p class="paragraph">Title must be in 20 points Times New Roman font. Author name must be in 11 points times new roman font. Author affiliation must be in 10 points italic Times new roman. Email address must be in 10 points times new roman font.</p>\n<p class="paragraph">All title and author details must be in single-column format and must be centered. Every word in a title must be capitalized. Email address is compulsory for the corresponding author.</p>\n\n<ol type="A"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="A" class="paragraph"><em>Section Headings</em></p></li></ol>\n<p class="paragraph">No more than three levels of headings should be used. All headings must be in 10pt font. Every word in a heading must be capitalized except for short minor words as listed in Section III-B.</p>\n<p class="paragraph"><em><em>Level–1 Heading</em>:</em> A level–1 heading must be in Small Caps, centered and numbered using uppercase Roman numerals. For example, see heading “III Page Style” of this document. The two level–1 headings which must not be numbered are “Acknowledgment” and “References”.</p>\n<p class="paragraph"><em><em>Level–2 Heading:</em></em> A level–2 heading must be in Italic, left-justified and numbered using an uppercase alphabetic letter followed by a period. For example, see heading “C. Section Headings” above.</p><ol type="none"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em><em>Level–3 Heading:</em> A level–3 heading must be indented, in Italic and numbered with an Arabic numeral followed by a right parenthesis. The level–3 heading must end with a colon. The body of the level–3 section immediately follows the level–3 heading in the same paragraph. For example, this paragraph begins with a level–3 heading.</em></p></li></ol>\n<h4>Figures and Tables</h4>\n<p class="paragraph">Figures and tables must be centered in the column. Large figures and tables may span across both columns. Any table or figure that takes up more than 1 column width must be positioned either at the top or at the bottom of the page.</p>\n<h4>Figure Captions</h4>\n<p class="paragraph">Figures must be numbered using Arabic numerals. Figure captions must be in 8 pt Regular font. Captions of a single line must be centered whereas multi-line captions must be justified. Captions with figure numbers must be placed after their associated figures</p>\n<figure><img data-original-name="Picture 1" src="http://filehosting:9000/uploads/9839b589f8de_medium.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&amp;X-Amz-Credential=nonRootUser%2F20231212%2Fus-east-1%2Fs3%2Faws4_request&amp;X-Amz-Date=20231212T054545Z&amp;X-Amz-Expires=86400&amp;X-Amz-Signature=954fea9954244f34877e04720bb5fbf6f1815d3f8d05692951d6badd7e412c32&amp;X-Amz-SignedHeaders=host" data-fileid="557f39fc-5033-4aa8-960d-48b3a3435fdd" alt="Image1.png"></figure>\n<h4>Table Captions</h4>\n<p class="paragraph">Tables must be numbered using uppercase Roman numerals. Table captions must be centred and in 8 pt Regular font with Small Caps. Every word in a table caption must be capitalized except for short minor words as listed in Section III-B. Captions with table numbers must be placed before their associated tables, as shown in Table</p>\n<table><tbody><tr><td>\n<p class="paragraph"><em>Sr. No.</em></p></td><td>\n<p class="paragraph"><em>Heading1</em></p></td><td>\n<p class="paragraph"><em>Heading2</em></p></td><td>\n<p class="paragraph"><em>Heading3</em></p></td><td>\n<p class="paragraph"><em>Heading 4</em></p></td><td>\n<p class="paragraph"><em>Heading5</em></p></td><td>\n<p class="paragraph"><em>Heading 6</em></p></td></tr><tr><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td><td>\n<p class="paragraph"></p></td></tr></tbody></table>\n<h4>Page Numbers, Headers and Footers</h4>\n<p class="paragraph">Page numbers, headers and footers must not be used.</p>\n<h4>Links and Bookmarks</h4>\n<p class="paragraph">All hypertext links and section bookmarks will be removed from papers during the processing of papers for publication. If you need to refer to an Internet email address or URL in your paper, you must type out the address or URL fully in Regular font.</p><ol type="none"><li>\n<p data-xsweet-outline-level="0" data-xsweet-list-level="0" data-mso-list-format="none" class="paragraph"><em>References</em></p></li></ol>\n<p class="paragraph">The heading of the References section must not be numbered. All reference items must be in 8 pt font. Please use Regular and Italic styles to distinguish different fields as shown in the References section.Number the reference items consecutively in square brackets (e.g. [1]).</p>\n<ol type="1"><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Ding, W. and Marchionini, G. 1997 A Study on Video Browsing Strategies. Technical Report. University of Maryland at College Park.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Tavel, P. 2007 Modeling and Simulation Design. AK Peters Ltd.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Sannella, M.&nbsp;J. 1994 Constraint Satisfaction and Debugging for Interactive User Interfaces. Doctoral Thesis. UMI Order Number: UMI Order No. GAX95–09398., University of Washington.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Brown, L.&nbsp;D., Hua, H., and Gao, C. 2003. A widget framework for augmented interaction in SCAPE.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Y.&nbsp;T. Yu, M.&nbsp;F. Lau, “A comparison of MC/DC, MUMCUT and several other coverage criteria for logical decisions”, Journal of Systems and Software, 2005, in press.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Spector, A.&nbsp;Z. 1989. Achieving application requirements. In Distributed Systems, S. Mullende</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Forman, G. 2003. An extensive empirical study of feature selection metrics for text classification. J. Mach. Learn. Res. 3 (Mar. 2003), 1289–1305.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Fröhlich, B. and Plate, J. 2000. The cubic mouse: a new device for three-dimensional input. In Proceedings of the SIGCHI Conference on Human Factors in Computing Systems.</p></li><li>\n<p data-xsweet-list-level="0" data-mso-list-format="1" class="paragraph">Bowman, M., Debray, S.&nbsp;K., and Peterson, L.&nbsp;L. 1993. Reasoning about naming systems..</p></li><li>\n</li></ol>\n</body></html>',
          abstract: null,
          history: null,
        },
        submission:
          '{"doi":"DOI: 10.1234/abcd.5678","link":"Testing link","title":"","labels":"readyToPublish","topics":["diagnostics","epidemiology"],"journal":"Journal of Cognitive Sciences","ourTake":"<p class=\\"paragraph\\">In this manuscript, we provide a comprehensive analysis of Quantum Cognition, emphasizing the significance of embracing novel perspectives in the intersection of quantum theory and cognitive processes. Our take centers on fostering a deeper understanding of quantum phenomena\'s potential impact on human cognition and decision-making.</p>","abstract":"<p class=\\"paragraph\\">This manuscript delves into the uncharted territories of Quantum Cognition, aiming to shed light on innovative paradigms and contribute to the evolving landscape of research. The study employs a multidisciplinary approach, synthesizing insights from cognitive psychology, quantum theory, and computational modeling to address key questions in the field.</p>","editDate":"2023-12-12","keywords":"Quantum cognition Cognitive processes Quantum-inspired modeling Interdisciplinary research","firstAuthor":"Dr. Allison Quantum Explorer","limitations":"<p class=\\"paragraph\\"><strong>Sample Size:</strong> The study acknowledges limitations in sample size, which may impact the generalizability of the findings.</p><ul><li><p class=\\"paragraph\\"><strong>Complexity of Quantum Models:</strong> The intricacies of quantum-inspired models may pose challenges in interpretation and application.</p></li><li><p class=\\"paragraph\\"><strong>External Validity:</strong> Generalizing findings to real-world scenarios beyond controlled experiments may be limited.</p></li></ul>","mainFindings":"<p class=\\"paragraph\\">Quantum-like interference patterns in decision-making processes.</p><ol><li><p class=\\"paragraph\\">Emergence of entangled cognitive states in problem-solving.</p></li><li><p class=\\"paragraph\\">The role of contextuality in shaping cognitive preferences.</p></li></ol>","datePublished":"December 12, 2023","reviewCreator":" Dr. Anakin Skywalker","studyStrengths":"<p class=\\"paragraph\\"><strong>Robust Methodology:</strong> Our research employs a rigorous methodology, incorporating quantum-inspired models and experimental validations to ensure the reliability and validity of our findings.</p><ul><li><p class=\\"paragraph\\"><strong>Interdisciplinary Insights:</strong> We bridge disciplinary boundaries, offering a holistic perspective that enriches the current discourse in Quantum Cognition.</p></li><li><p class=\\"paragraph\\"><strong>Collaborative Approach:</strong> This study benefits from a collaborative effort, bringing together experts from cognitive science, physics, and computer science to enrich the research landscape.</p></li></ul>"}',
        manuscriptVersions: [],
        channels: [
          {
            __typename: 'Channel',
            id: 'b48c56a8-a8f3-4cc6-8d34-73ecb954e5ab',
            type: 'all',
            topic: 'Manuscript discussion',
          },
          {
            __typename: 'Channel',
            id: '0ffe8c3d-55e8-4296-a523-3fc6decc910f',
            type: 'editorial',
            topic: 'Editorial discussion',
          },
        ],
      },
    },
  ],
  threadedDiscussionProps: {
    threadedDiscussions: [],
    currentUser: {
      __typename: 'User',
      id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
      profilePicture: '/profiles/default_avatar.svg',
      username: 'Han Solo',
      globalRoles: [],
      groupRoles: ['user'],
      email: 'hansolo@gmail.com',
      recentTab: 'reviews',
      preferredLanguage: 'en-US',
      defaultIdentity: {
        __typename: 'Identity',
        identifier: '0000-0002-1203-5003',
        email: null,
        type: 'orcid',
        aff: '',
        id: 'f7ff6070-ee2d-4401-a958-b8055210cb2a',
      },
      isOnline: true,
      teams: [
        {
          __typename: 'Team',
          id: '93e4e02d-15a9-4495-ae2b-7572d03ab598',
          objectId: 'df07cbf3-87dc-496b-9ce1-974c452b6d88',
          objectType: 'Group',
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '201fbb87-cc14-456e-9baf-bc984b4527c2',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'e8e1489d-41e5-4f56-bafb-f9daf91ca910',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '0589f676-a018-4974-9f32-859bcd5ee0b8',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '25e11649-dc98-4fb2-bfe3-d555758929f1',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '8802718e-9b10-4920-8014-240b6dcb7fdc',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '646277da-3bde-415f-8102-c751d0557144',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '1c224005-88f7-4335-a849-b95703e738bf',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '65cb3a22-5319-4c27-8617-2b12b4959545',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'fcbecc85-1201-4646-8d51-6604587e88aa',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'cb7c49ce-c787-4d75-88b3-6094c52ca5e5',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '2517cc9c-261b-4c8a-a4bb-7ba5fb3f5629',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '08973298-7617-4041-98b7-1354f962760a',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'ed9b17c2-68b7-4924-a8b4-78879c914c76',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '294af389-447a-4ca5-abb6-993d9f95b5de',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '519b8949-c078-4324-a9e0-e8d1092f1ff2',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'b048db05-1665-4993-b917-875aac7d3955',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'dd7e97bd-6d74-46d9-a8cc-3339858f3f6e',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '50da8083-5924-44f9-960d-73f1333183ab',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '48cc0c4f-1696-43f8-aaa9-fc8d1d810ad6',
          objectId: 'fe163028-9018-4b1c-a5d8-589af43ca59e',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'accepted',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: 'b460225a-1ea9-4522-97e1-1bdc4623ed6e',
          objectId: '21a4bfc2-ed32-4f8f-b8bc-af41dd90fcf5',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '5c0bf429-8d7a-4637-9b63-2537d811423b',
          objectId: '39d0ffc6-38c4-4b2d-98a7-788ab4c4f875',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'inProgress',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: 'ce101c09-1800-4af6-af36-8e0af46aea82',
          objectId: 'eadad4aa-707d-474a-adc2-899b577867c9',
          objectType: 'Group',
          members: [
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: null,
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '1962cf88-cb9f-450f-9e49-c39b63d3c9f1',
          objectId: 'ac248f80-4098-41d1-9134-372d758b60e8',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'inProgress',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: 'c6d4d182-3329-478d-9053-3b4338e7512e',
          objectId: '9a6a8494-4dd2-49b8-a24f-9aa0b5f9787e',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '2696466a-d514-4b4a-b996-31d16cd37d56',
          objectId: '5f9a457c-34e7-4ed3-a607-cf9ad7fc74df',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'inProgress',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '2f111f7c-82e2-4821-a3c7-fdb5478580f8',
          objectId: 'b730ae50-a3bd-48ee-a173-cfa983974303',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '70db9e64-5154-4a44-bf7d-aa4b35090655',
          objectId: 'c52d138d-c1d8-42a3-b8c7-8da9e6bbf89b',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: 'ef173a14-94ea-46a0-b975-910c7bb03f44',
          objectId: 'd67afd79-937b-4cfa-9926-17c7447eb345',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '2c90d3ab-e212-4505-bd7d-27f1fe679493',
          objectId: 'bb656664-69a5-4a1f-bd63-4ef9c3e2a962',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '14c1c199-286a-4b3c-ae1a-cf25d576b930',
          objectId: 'ce95f47a-5e5a-44f8-a9f2-8fa9697e661e',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '5b3710b9-5196-4ccf-9aa8-63dcf07da078',
          objectId: '2c899708-eb37-4d16-b9b1-91377bac9acb',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'inProgress',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: 'af2a0065-5843-4284-aa55-d85622e05784',
          objectId: 'e9994986-1f65-41ea-8c45-9846b0c513a5',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '10ab6677-957b-4a4a-80c7-42765e08d4af',
          objectId: 'c3f7422e-2cf0-4041-ade7-d24e7c153b1d',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '4c90529f-15f9-4874-8397-f1591faef8db',
          objectId: 'a87992a9-9f80-4bd8-b77e-d2409af5ebfd',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '746892a3-6866-489b-84f1-1d61cf42f7b0',
          objectId: 'a87992a9-9f80-4bd8-b77e-d2409af5ebfd',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'inProgress',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '9e50fd53-14e2-439e-94f2-78355ee3d864',
          objectId: '72ec5a07-90f3-4102-adbe-60a1c10397b8',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '9d25ccb6-65a1-41d1-a5ed-63a56bf4f813',
          objectId: '419467f2-792f-4056-a0fb-4ffff26e7e87',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '288e2a3b-c373-46f8-b129-828a48489b2d',
          objectId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '275ee40c-f031-4d58-9659-975cc3770207',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '11ce10aa-144e-4e4d-97ef-1f0fcb8dc15e',
          objectId: '9e9f45ee-d487-427b-9dfd-57565a66df5c',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'invited',
              user: {
                __typename: 'User',
                id: 'b12ed2fa-d66c-4da8-b99b-b004a47882c5',
              },
            },
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
        {
          __typename: 'Team',
          id: '3c69e47e-4a21-41c1-a14b-88f42ba746a4',
          objectId: '33ab269d-a3d5-428f-8f29-b87239058856',
          objectType: 'manuscript',
          members: [
            {
              __typename: 'TeamMember',
              status: 'completed',
              user: {
                __typename: 'User',
                id: '7ab6e07d-4d1d-4f98-b0c8-10ed20dbec8d',
              },
            },
          ],
        },
      ],
    },
    firstVersionManuscriptId: 'bb68cd72-a1e5-41d4-b494-d96bddd37ef7',
  },
}

Base.args = baseProps

export default {
  title: 'Review/ReviewLayout',
  component: ReviewLayout,
  parameters: {
    docs: {
      page: () => (
        <DesignEmbed figmaEmbedLink="https://www.figma.com/file/8XdAAiZTvjXCOC6ZYJ66yt/Kotahi?type=design&node-id=2981-6342&mode=design&t=vRCbsV5KxdrTzi0V-0" />
      ),
    },
  },
  argTypes: {},
}

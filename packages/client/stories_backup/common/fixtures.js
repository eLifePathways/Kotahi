export const manuscriptWithoutTeams = {
  id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
  shortId: 7,
  created: '2022-04-06T12:31:21.767Z',
  files: [],
  decision: '',
  teams: [],
  status: 'accepted',
  meta: {
    manuscriptId: 'd75dd479-8658-418a-91b6-4bee523d25b1',
    source: null,
    history: null,
    __typename: 'ManuscriptMeta',
  },
  submission:
    '{"$doi":"","cover":"","$title":"New submission 06/04/2022, 18:01:21","topics":[],"Funding":"","$abstract":"","datacode":"","objectType":"software","references":"","$authors":"","dateAccepted":"","dateReceived":"","copyrightYear":"","datePublished":"","DecisionLetter":"","copyrightHolder":"","reviewingEditor":"","EditorsEvaluation":"","competingInterests":"","copyrightStatement":"","authorContributions":"","AuthorCorrespondence":""}',
  published: '2022-04-08T07:58:54.517Z',
  manuscriptVersions: [],
  channels: [
    {
      id: '413d5e21-22d3-4329-8dd5-a4d877c6fc0e',
      type: 'all',
      topic: 'Manuscript discussion',
      __typename: 'Channel',
    },
    {
      id: '746fc9ea-1d80-454b-9a83-9ec39d7a5959',
      type: 'editorial',
      topic: 'Editorial discussion',
      __typename: 'Channel',
    },
  ],
  __typename: 'Manuscript',
}

export const manuscriptWithTeams = {
  ...manuscriptWithoutTeams,
  reviews: [
    {
      id: 'f6a31884-ffa2-4ebf-81f4-5df10d417f12',
      created: '2022-04-07T12:31:42.209Z',
      updated: '2022-04-08T07:57:52.198Z',
      decisionComment: {
        id: '4e31142e-935b-46a1-bf84-b39ea3ae0c2c',
        commentType: 'decision',
        content: '<p class="paragraph">Approved</p>',
        files: [],
        __typename: 'ReviewComment',
      },
      reviewComment: null,
      confidentialComment: null,
      isDecision: true,
      isHiddenFromAuthor: null,
      isCollaborative: false,
      isLock: false,
      isHiddenReviewerName: null,
      canBePublishedPublicly: false,
      recommendation: 'accepted',
      user: {
        id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
        username: 'Kotahi Dev',
        profilePicture: '/profiles/Kotahi Dev.png',
        defaultIdentity: {
          id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
          identifier: '0000-0002-1203-5003',
          __typename: 'Identity',
        },
        __typename: 'User',
      },
      __typename: 'Review',
    },
  ],
  teams: [
    {
      id: '24392be5-4c42-4bc2-a5f2-05637f09ac5c',
      name: 'Author',
      role: 'author',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: 'f6dd51e9-3591-4748-84c1-26bfa6450426',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: null,
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
    {
      id: '72c6cd72-107e-4078-b8fd-41e5bfeff15b',
      name: 'Senior Editor',
      role: 'seniorEditor',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: 'de5e425c-cc20-4489-9809-19be5e0b8165',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
              name: 'Kotahi Dev',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: null,
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
    {
      id: '9d27fcea-be8f-40e2-8cf6-33da2ce1be80',
      name: 'Handling Editor',
      role: 'handlingEditor',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: 'f836d546-8405-45cc-8568-f836ffe85bcb',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
              name: 'Kotahi Dev',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: null,
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
    {
      id: '93d2c87e-e534-44cd-abdb-b2a5ed49b375',
      name: 'Editor',
      role: 'editor',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: '165817d2-9b95-4213-905d-3d213950202e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '413bd6a7-dcb2-4724-9bb7-f26952b40008',
              name: 'Kotahi Dev',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: null,
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
    {
      id: '8ad9c0a3-663a-404c-aca9-321d3c22d526',
      name: 'Reviewers',
      role: 'reviewer',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'invited',
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
  ],
}

export const manuscriptWithSeveralReviewers = {
  ...manuscriptWithTeams,
  teams: [
    {
      id: '8ad9c0a3-663a-404c-aca9-321d3c22d526',
      name: 'Reviewers',
      role: 'reviewer',
      manuscript: {
        id: 'd75dd479-8658-418a-91b6-4bee523d25b1',
        __typename: 'Manuscript',
      },
      members: [
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'invited',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e1786',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ff5',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a4',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'invited',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'completed',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'rejected',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'rejected',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'rejected',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'rejected',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'accepted',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'accepted',
          __typename: 'TeamMember',
        },
        {
          id: 'e017086e-e6d6-4cbc-8a19-b62a458e178e',
          user: {
            id: '1fe868b5-da3a-4d19-958f-2e73eb753ffd',
            username: 'Kotahi Dev',
            defaultIdentity: {
              id: '37042af9-a364-4a41-8d2c-cf072dea33a9',
              name: 'Kotahi Dev ',
              __typename: 'Identity',
            },
            __typename: 'User',
          },
          status: 'invited',
          __typename: 'TeamMember',
        },
      ],
      __typename: 'Team',
    },
  ],
}

/* eslint-disable */

const gql = require('graphql-tag')
const { createGraphqlTestServer, migrationManager } = require('@coko/server')

const { Group, User, Manuscript, Team, Config } = require('../../../../models')

const gqlServer = createGraphqlTestServer()

const comments = [
  {
    id: '6b46da14-ebc3-4398-a243-018d8c0f9c79',
    from: 656,
    to: 660,
    data: {
      pmTo: 660,
      type: 'comment',
      group: 'main',
      pmFrom: 656,
      viewId: 'main',
      conversation: [
        {
          content: 'demo comment',
          timestamp: 1601559766164,
          displayName: 'demo',
        },
      ],
    },
  },
  {
    id: 'dbc46918-f926-4126-85c7-2a6876d24528',
    from: 1821,
    to: 1827,
    data: {
      pmTo: 1827,
      type: 'comment',
      group: 'main',
      pmFrom: 1821,
      viewId: 'main',
      conversation: [
        {
          content: 'comment',
          timestamp: 1601559775708,
          displayName: 'demo',
        },
      ],
    },
  },
]

describe('Manuscript API', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  afterEach(async () => {
    await Config.query().delete()
    await Manuscript.query().delete()
    await Group.query().delete()
    await User.query().delete()
    await Team.query().delete()
  })

  it('reads wax comments', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    const manuscript = await Manuscript.insert({
      meta: {
        comments,
      },
    })

    const team = await Team.insert({
      role: 'groupManager',
      displayName: 'Group Manager',
      objectId: group.id,
      objectType: group.type,
    })

    await Team.addMember(team.id, user.id)

    const QUERY = gql`
      query Manuscript($id: ID!) {
        manuscript(id: $id) {
          id
          meta {
            comments
          }
        }
      }
    `

    const result = await gqlServer.executeOperation(
      {
        query: QUERY,
        variables: { id: manuscript.id },
      },
      {
        contextValue: {
          userId: user.id,
          req: {
            headers: {
              'group-id': group.id,
            },
          },
        },
      },
    )

    const response = result.body.singleResult.data.manuscript
    const commentsResponse = response.meta.comments
    expect(typeof commentsResponse).toBe('string')

    const parsedComments = JSON.parse(commentsResponse)
    expect(parsedComments).toHaveLength(2)
    expect(parsedComments[0].id).toEqual(comments[0].id)
    expect(parsedComments[1].id).toEqual(comments[1].id)
  })

  it('updates wax comments', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await Config.query().insert({
      active: true,
      groupId: group.id,
      formData: {},
    })

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      submission: {},
      meta: {
        comments: [],
      },
    })

    const team = await Team.insert({
      role: 'groupManager',
      displayName: 'Group Manager',
      objectId: group.id,
      objectType: group.type,
    })

    await Team.addMember(team.id, user.id)

    const QUERY = gql`
      mutation UpdateManuscript($id: ID!, $input: String!) {
        updateManuscript(id: $id, input: $input) {
          id
          meta {
            comments
          }
        }
      }
    `

    await gqlServer.executeOperation(
      {
        query: QUERY,
        variables: {
          id: manuscript.id,
          input: JSON.stringify({
            meta: {
              source: '<p>hello</p>',
              comments: JSON.stringify(comments),
            },
          }),
        },
      },
      {
        contextValue: {
          userId: user.id,
          req: {
            headers: {
              'group-id': group.id,
            },
          },
        },
      },
    )

    const updatedManuscript = await Manuscript.findById(manuscript.id)
    const { comments: writtenComments } = updatedManuscript.meta
    expect(writtenComments).toHaveLength(2)
    expect(writtenComments[0].id).toBe(comments[0].id)
    expect(writtenComments[1].id).toBe(comments[1].id)
  })
})

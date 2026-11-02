import { describe, afterEach, beforeAll, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
} from '@coko/server'

import { Group, User, Manuscript, Team, Config } from '../../../../models'

const activateConfig = (
  groupId: string,
  showSections: string[],
): Promise<Config> =>
  Config.insert({
    groupId,
    active: true,
    formData: { dashboard: { showSections } },
  })

const QUERY = gql`
  query DashboardData {
    dashboardData {
      actionCardData {
        id
        type
        bucket
        manuscriptId
        shortId
        title
      }
      submissionsData {
        totalCount
      }
      reviewData {
        totalCount
      }
      editingQueueData {
        totalCount
      }
    }
  }
`

describe('Dashboard API', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()
  })

  afterEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  it('returns real dashboard data with schema-correct field and enum values', async () => {
    const group = await Group.insert({})
    const user = await User.insert({})

    await activateConfig(group.id, ['submission'])

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'new',
      shortId: 101,
      submission: { $title: 'A Title' },
    })

    const authorTeam = await Team.insert({
      objectId: manuscript.id,
      objectType: 'manuscript',
      role: 'author',
      displayName: 'Author',
    })

    await Team.addMember(authorTeam.id, user.id)

    const gqlServer = await createGraphqlTestServer()

    const result = await gqlServer.executeOperation(
      { query: QUERY },
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

    if (result.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(result.body.singleResult.errors).toBeUndefined()

    expect(result.body.singleResult.data?.dashboardData).toEqual({
      actionCardData: [
        {
          id: `authorSubmit-${manuscript.id}`,
          type: 'authorSubmit',
          bucket: 'submissions',
          manuscriptId: manuscript.id,
          shortId: '101',
          title: 'A Title',
        },
      ],
      submissionsData: { totalCount: 1 },
      reviewData: null,
      editingQueueData: null,
    })
  })

  it('rejects unauthenticated requests', async () => {
    const group = await Group.insert({})

    const gqlServer = await createGraphqlTestServer()

    const result = await gqlServer.executeOperation(
      { query: QUERY },
      {
        contextValue: {
          req: {
            headers: {
              'group-id': group.id,
            },
          },
        },
      },
    )

    if (result.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(result.body.singleResult.errors).toBeTruthy()
    expect(result.body.singleResult.data?.dashboardData).toBeFalsy()
  })
})

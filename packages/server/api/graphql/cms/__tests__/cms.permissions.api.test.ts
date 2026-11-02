import { describe, beforeAll, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import {
  config,
  createGraphqlTestServer,
  db,
  DbTestUtils,
  migrationManager,
  uuid,
} from '@coko/server'

import { Group, User, Team, TeamMember } from '../../../../models'

// Covers the CMS rules in permissions.js. The CMS pages in the client are
// only reachable by Group Admins and Admins, so the queries and mutations
// they use are restricted to those roles. The public Flax site reads a few
// queries with only a group-id header, so those stay open.

const MISSING_ID = uuid()

const ADMIN_ONLY_OPERATIONS = {
  cmsPage: {
    query: gql`
      query ($id: ID!) {
        cmsPage(id: $id) {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  getCmsFilesTree: {
    query: gql`
      query ($folderId: ID) {
        getCmsFilesTree(folderId: $folderId) {
          id
        }
      }
    `,
    variables: { folderId: MISSING_ID },
  },
  getCmsFileContent: {
    query: gql`
      query ($id: ID!) {
        getCmsFileContent(id: $id) {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  getFoldersList: {
    query: gql`
      query {
        getFoldersList {
          id
        }
      }
    `,
    variables: {},
  },
  addResourceToFolder: {
    query: gql`
      mutation ($id: ID!) {
        addResourceToFolder(id: $id, type: true) {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  deleteResource: {
    query: gql`
      mutation ($id: ID!) {
        deleteResource(id: $id) {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  renameResource: {
    query: gql`
      mutation ($id: ID!) {
        renameResource(id: $id, name: "renamed") {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  updateResource: {
    query: gql`
      mutation ($id: ID!) {
        updateResource(id: $id, content: "content") {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
  updateFlaxRootFolder: {
    query: gql`
      mutation ($id: ID!) {
        updateFlaxRootFolder(id: $id) {
          id
        }
      }
    `,
    variables: { id: MISSING_ID },
  },
}

const PUBLIC_OPERATIONS = {
  cmsLayout: {
    query: gql`
      query {
        cmsLayout {
          id
        }
      }
    `,
    variables: {},
  },
  cmsPages: {
    query: gql`
      query {
        cmsPages {
          id
        }
      }
    `,
    variables: {},
  },
  getActiveCmsFilesTree: {
    query: gql`
      query {
        getActiveCmsFilesTree
      }
    `,
    variables: {},
  },
}

type Operation = {
  query: ReturnType<typeof gql>
  variables: Record<string, unknown>
}

const ALLOWED = ['groupAdmin', 'admin']

const DENIED = ['anonymous', 'noRole', 'groupManager', 'groupAdminOfOtherGroup']

let groupId: string
let users: Record<string, string | undefined>

// The operations run against ids that don't exist, so an allowed caller may
// still get an error from the resolver. Only the permission error matters here.
const isDenied = async (
  username: string,
  { query, variables }: Operation,
): Promise<boolean> => {
  const gqlServer = await createGraphqlTestServer()

  const result = await gqlServer.executeOperation(
    { query, variables },
    {
      contextValue: {
        userId: users[username],
        req: { headers: { 'group-id': groupId } },
      },
    },
  )

  if (result.body.kind !== 'single') {
    throw new Error('Expected single result, got incremental')
  }

  const { errors } = result.body.singleResult

  return !!errors?.some(e => e.message === 'Not Authorised!')
}

const addToGroupTeam = async (
  group: string,
  role: string,
  displayName: string,
  userId: string,
): Promise<void> => {
  const team =
    (await Team.findOne({ objectId: group, role })) ||
    (await Team.insert({
      objectId: group,
      objectType: 'group',
      role,
      displayName,
    }))

  await TeamMember.insert({ teamId: team.id, userId })
}

describe('CMS permissions', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

    const group = await Group.insert({ name: 'cms-permissions-test' })
    const otherGroup = await Group.insert({ name: 'cms-permissions-other' })
    groupId = group.id

    const usernames = [
      'noRole',
      'groupManager',
      'groupAdmin',
      'groupAdminOfOtherGroup',
      'admin',
    ]

    users = Object.fromEntries(
      await Promise.all(
        usernames.map(async username => [
          username,
          (await User.insert({ username, email: `${username}@example.com` }))
            .id,
        ]),
      ),
    )

    users.anonymous = undefined

    await addToGroupTeam(
      group.id,
      'groupManager',
      'Group Manager',
      users.groupManager as string,
    )
    await addToGroupTeam(
      group.id,
      'groupAdmin',
      'Group Admin',
      users.groupAdmin as string,
    )
    await addToGroupTeam(
      otherGroup.id,
      'groupAdmin',
      'Group Admin',
      users.groupAdminOfOtherGroup as string,
    )

    const adminTeam =
      (await Team.findOne({ role: 'admin', global: true })) ||
      (await Team.insert({ role: 'admin', global: true, displayName: 'Admin' }))

    await TeamMember.insert({
      teamId: adminTeam.id,
      userId: users.admin as string,
    })
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe.each(Object.entries(ADMIN_ONLY_OPERATIONS))('%s', (_, operation) => {
    it.each(ALLOWED)('allows %s', async username => {
      expect(await isDenied(username, operation)).toBe(false)
    })

    it.each(DENIED)('denies %s', async username => {
      expect(await isDenied(username, operation)).toBe(true)
    })
  })

  describe.each(Object.entries(PUBLIC_OPERATIONS))(
    '%s (read by Flax)',
    (_, operation) => {
      it.each([...ALLOWED, ...DENIED])('allows %s', async username => {
        expect(await isDenied(username, operation)).toBe(false)
      })
    },
  )
})

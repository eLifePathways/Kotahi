import {
  describe,
  afterEach,
  beforeAll,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import gql from 'graphql-tag'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
  File,
  fileStorage,
} from '@coko/server'

import { Group, Identity, Team, User } from '../../../../models'
import { getRequestLoaders } from '../../requestLoaders'

const USER_QUERY = gql`
  query User($id: ID) {
    user(id: $id) {
      id
      defaultIdentity {
        id
        aff
        email
      }
    }
  }
`

describe('User API', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    fileStorage.init()
    await migrationManager.migrate()
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
  })

  describe('getRequestLoaders', () => {
    it('reuses loaders within a context and not across contexts', () => {
      const ctx = { req: { headers: {} } }

      expect(getRequestLoaders(ctx)).toBe(getRequestLoaders(ctx))
      expect(getRequestLoaders(ctx)).not.toBe(
        getRequestLoaders({ req: { headers: {} } }),
      )
    })

    it('batches default identity lookups by user id', async () => {
      const userOne = await User.insert({})
      const userTwo = await User.insert({})
      const userWithoutIdentity = await User.insert({})

      const identityOne = await Identity.insert({
        userId: userOne.id,
        isDefault: true,
        type: 'local',
      })

      const identityTwo = await Identity.insert({
        userId: userTwo.id,
        isDefault: true,
        type: 'local',
      })

      const { defaultIdentities } = getRequestLoaders({ req: {} })

      const results = await Promise.all([
        defaultIdentities.load(userTwo.id),
        defaultIdentities.load(userWithoutIdentity.id),
        defaultIdentities.load(userOne.id),
      ])

      expect(results.map(identity => identity?.id ?? null)).toEqual([
        identityTwo.id,
        null,
        identityOne.id,
      ])
    })

    it('does not cache for contexts without a request (e.g. subscriptions)', async () => {
      const user = await User.insert({})

      const identity = await Identity.insert({
        userId: user.id,
        isDefault: true,
        type: 'local',
        aff: 'Before',
      })

      const ctx = {}
      const before = await getRequestLoaders(ctx).defaultIdentities.load(
        user.id,
      )
      await Identity.query().patch({ aff: 'After' }).findById(identity.id)
      const after = await getRequestLoaders(ctx).defaultIdentities.load(user.id)

      expect(before.aff).toBe('Before')
      expect(after.aff).toBe('After')
    })
  })

  it('returns an up-to-date default identity on each request', async () => {
    const group = await Group.insert({})
    const user = await User.insert({ email: 'author@example.com' })

    const identity = await Identity.insert({
      userId: user.id,
      isDefault: true,
      type: 'local',
      aff: 'Before',
    })

    const gqlServer = await createGraphqlTestServer()

    const fetchAff = async (): Promise<string> => {
      const result = await gqlServer.executeOperation(
        { query: USER_QUERY, variables: { id: user.id } },
        {
          contextValue: {
            userId: user.id,
            req: { headers: { 'group-id': group.id } },
          },
        },
      )

      if (result.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      expect(result.body.singleResult.errors).toBeUndefined()
      const data = result.body.singleResult.data as {
        user: { defaultIdentity: { id: string; aff: string; email: string } }
      }
      expect(data.user.defaultIdentity.id).toBe(identity.id)
      expect(data.user.defaultIdentity.email).toBe('author@example.com')
      return data.user.defaultIdentity.aff
    }

    expect(await fetchAff()).toBe('Before')
    await Identity.query().patch({ aff: 'After' }).findById(identity.id)
    expect(await fetchAff()).toBe('After')
  })

  it('loads profile pictures for a list of users in one query', async () => {
    const group = await Group.insert({})

    const picture = (name: string): Promise<File> =>
      File.insert({
        name,
        storedObjects: [
          {
            type: 'small',
            key: `small_${name}`,
            mimetype: 'image/png',
            extension: 'png',
            size: 100,
          },
        ],
      })

    const one = await User.insert({
      username: 'One',
      profilePicture: (await picture('one.png')).id,
    })

    const two = await User.insert({
      username: 'Two',
      profilePicture: (await picture('two.png')).id,
    })

    const withoutPicture = await User.insert({ username: 'Three' })

    const groupUsers = await Team.insert({
      objectId: group.id,
      objectType: 'group',
      role: 'user',
      displayName: 'User',
    })

    for (const user of [one, two, withoutPicture]) {
      // eslint-disable-next-line no-await-in-loop
      await Team.addMember(groupUsers.id, user.id)
    }

    const admin = await User.insert({ username: 'Admin' })

    const adminTeam = await Team.insert({
      role: 'admin',
      global: true,
      displayName: 'Admin',
    })

    await Team.addMember(adminTeam.id, admin.id)

    const findFilesByIds = vi.spyOn(File, 'findByIds')

    const QUERY = gql`
      query {
        users {
          id
          profilePicture
        }
      }
    `

    const gqlServer = await createGraphqlTestServer()

    const result = await gqlServer.executeOperation(
      { query: QUERY },
      {
        contextValue: {
          userId: admin.id,
          req: { headers: { 'group-id': group.id } },
        },
      },
    )

    if (result.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(result.body.singleResult.errors).toBeUndefined()

    const { users } = result.body.singleResult.data as {
      users: { id: string; profilePicture: string | null }[]
    }

    const pictureOf = (id: string): string | null | undefined =>
      users.find(u => u.id === id)?.profilePicture

    expect(users).toHaveLength(3)
    expect(pictureOf(one.id)).toContain('small_one.png')
    expect(pictureOf(two.id)).toContain('small_two.png')
    expect(pictureOf(withoutPicture.id)).toBeNull()
    expect(findFilesByIds).toHaveBeenCalledTimes(1)
  })
})

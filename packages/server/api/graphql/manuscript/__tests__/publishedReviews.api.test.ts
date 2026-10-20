import {
  describe,
  afterEach,
  beforeAll,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'
import { migrationManager, db, config, DbTestUtils } from '@coko/server'

import { Identity, Manuscript, Review, Team, User } from '../../../../models'

// Loaded after config.init(), as the controllers read config on import
let resolvers: any
let publishedManuscriptEditors: any

describe('Published reviews API', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

    resolvers = (await import('../manuscript.resolvers')).default
    ;({ publishedManuscriptEditors } =
      await import('../../../../controllers/manuscript/manuscript.controllers'))
  })

  afterEach(async () => {
    vi.restoreAllMocks()
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  it('batches review users within a request', async () => {
    const manuscript = await Manuscript.insert({})
    const one = await User.insert({ username: 'One' })
    const two = await User.insert({ username: 'Two' })

    const reviewOne = await Review.insert({
      manuscriptId: manuscript.id,
      userId: one.id,
    })

    const reviewTwo = await Review.insert({
      manuscriptId: manuscript.id,
      userId: two.id,
    })

    const getUsersOfReviews = vi.spyOn(Review, 'getUsersOfReviews')
    const ctx = { req: { headers: {} } }

    const [usersOne, usersTwo] = await Promise.all([
      resolvers.PublishedReview.users(reviewOne, {}, ctx),
      resolvers.PublishedReview.users(reviewTwo, {}, ctx),
    ])

    expect(getUsersOfReviews).toHaveBeenCalledTimes(1)
    expect(usersOne.map(u => u.id)).toEqual([one.id])
    expect(usersTwo.map(u => u.id)).toEqual([two.id])
  })

  it('returns an anonymous user for hidden reviewer names', async () => {
    const getUsersOfReviews = vi.spyOn(Review, 'getUsersOfReviews')

    const users = await resolvers.PublishedReview.users(
      { id: 'a', isHiddenReviewerName: true, userId: null },
      {},
      { req: {} },
    )

    expect(users).toEqual([{ id: '', username: 'Anonymous User' }])
    expect(getUsersOfReviews).not.toHaveBeenCalled()
  })

  it("never exposes a reviewer's email", async () => {
    const user = await User.insert({ email: 'reviewer@example.com' })

    const identity = await Identity.insert({
      userId: user.id,
      isDefault: true,
      type: 'orcid',
      identifier: '0000-0002-1825-0097',
    })

    const ctx = { req: {} }

    const result = await resolvers.ReviewUser.defaultIdentity(user, {}, ctx)

    expect(result.id).toBe(identity.id)
    expect(result.identifier).toBe('0000-0002-1825-0097')
    expect(result.email).toBeNull()

    expect(
      await resolvers.ReviewUser.defaultIdentity({ id: '' }, {}, ctx),
    ).toBeNull()
  })

  it('gets published manuscript editors', async () => {
    const manuscript = await Manuscript.insert({})
    const senior = await User.insert({ username: 'Senior' })
    const handling = await User.insert({ username: 'Handling' })
    const author = await User.insert({ username: 'Author' })

    const addTeam = async (
      role: string,
      displayName: string,
      userId: string,
    ): Promise<void> => {
      const team = await Team.insert({
        objectId: manuscript.id,
        objectType: 'manuscript',
        role,
        displayName,
      })

      await Team.addMember(team.id, userId)
    }

    await addTeam('seniorEditor', 'Senior Editor', senior.id)
    await addTeam('handlingEditor', 'Handling Editor', handling.id)
    await addTeam('author', 'Author', author.id)

    const editors = await publishedManuscriptEditors(manuscript)

    expect(editors).toHaveLength(2)
    expect(editors).toEqual(
      expect.arrayContaining([
        { name: 'Senior', role: 'seniorEditor' },
        { name: 'Handling', role: 'handlingEditor' },
      ]),
    )
  })
})

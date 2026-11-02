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
} from '@coko/server'

import {
  Form,
  Group,
  Identity,
  Manuscript,
  Review,
  Team,
  User,
} from '../../../../models'

const formWithFiles = (groupId: string, category: string): Promise<Form> =>
  // @ts-ignore
  Form.insert({
    groupId,
    category,
    purpose: category,
    structure: {
      children: [
        {
          id: '0f2d6c1e-5a4b-4c3d-8e9f-1a2b3c4d5e6f',
          name: 'supplementary',
          component: 'SupplementaryFiles',
        },
      ],
    },
  })

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

  it("loads a published manuscript's reviews once for reviews and decisions", async () => {
    const group = await Group.insert({})
    await formWithFiles(group.id, 'review')
    await formWithFiles(group.id, 'decision')

    const manuscript = await Manuscript.insert({
      groupId: group.id,
      status: 'published',
      published: new Date().toISOString(),
      formFieldsToPublish: [],
    })

    const reviewer = await User.insert({ username: 'Reviewer' })
    const editor = await User.insert({ username: 'Editor' })

    const attachment = (name: string): Promise<File> =>
      File.insert({
        name,
        objectId: manuscript.id,
        storedObjects: [
          {
            type: 'original',
            key: name,
            mimetype: 'application/pdf',
            extension: 'pdf',
            size: 100,
          },
        ],
      })

    const reviewFile = await attachment('review.pdf')
    const decisionFile = await attachment('decision.pdf')

    const review = await Review.insert({
      manuscriptId: manuscript.id,
      userId: reviewer.id,
      jsonData: { supplementary: [reviewFile.id] },
    })

    const decision = await Review.insert({
      manuscriptId: manuscript.id,
      userId: editor.id,
      isDecision: true,
      jsonData: { supplementary: [decisionFile.id] },
    })

    const orderReviewPerUsername = vi.spyOn(Review, 'orderReviewPerUsername')
    const findFilesByIds = vi.spyOn(File, 'findByIds')

    const QUERY = gql`
      query PublishedManuscript($id: ID!) {
        publishedManuscript(id: $id) {
          reviews {
            id
          }
          decisions {
            id
          }
        }
      }
    `

    const gqlServer = await createGraphqlTestServer()

    const result = await gqlServer.executeOperation(
      { query: QUERY, variables: { id: manuscript.id } },
      { contextValue: { req: { headers: { 'group-id': group.id } } } },
    )

    if (result.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(result.body.singleResult.errors).toBeUndefined()

    const data = result.body.singleResult.data as {
      publishedManuscript: {
        reviews: { id: string }[]
        decisions: { id: string }[]
      }
    }

    expect(data.publishedManuscript.reviews.map(r => r.id)).toEqual([review.id])

    expect(data.publishedManuscript.decisions.map(r => r.id)).toEqual([
      decision.id,
    ])

    expect(orderReviewPerUsername).toHaveBeenCalledTimes(1)

    // One query for the files of all reviews (findByIds is also used for users)
    const fileLookups = findFilesByIds.mock.calls.filter(([ids]) =>
      ids.includes(reviewFile.id),
    )

    expect(fileLookups).toHaveLength(1)
    expect([...fileLookups[0][0]].sort()).toEqual(
      [reviewFile.id, decisionFile.id].sort(),
    )
  })
})

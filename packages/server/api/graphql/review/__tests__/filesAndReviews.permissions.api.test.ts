import { describe, beforeAll, afterAll, it, expect } from 'vitest'
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
  Group,
  User,
  Manuscript,
  Team,
  TeamMember,
  Config,
  Review,
} from '../../../../models'

import seedForms from '../../../../scripts/seedForms'

// Covers the File and Review type rules in permissions.js: who can read a
// manuscript's files and reviews. The `manuscripts` and `getSpecificFiles`
// queries are open to any logged-in user, so they're what exposes these
// objects to someone with no role on the manuscript.

const MANUSCRIPTS = gql`
  query {
    manuscripts {
      id
      reviews {
        id
      }
      files {
        id
      }
    }
  }
`

const MANUSCRIPT = gql`
  query ($id: ID!) {
    manuscript(id: $id) {
      id
      reviews {
        id
      }
      files {
        id
      }
      manuscriptVersions {
        id
        reviews {
          id
        }
        files {
          id
        }
      }
    }
  }
`

const SPECIFIC_FILES = gql`
  query ($ids: [ID!]!) {
    getSpecificFiles(ids: $ids) {
      id
    }
  }
`

type Fixture = {
  groupId: string
  manuscriptId: string
  versionId: string
  reviewId: string
  decisionId: string
  manuscriptFileId: string
  reviewFileId: string
  groupFileId: string
  users: Record<string, string>
}

let fixture: Fixture

// Team display names have to match the roles configured in config.ts
const DISPLAY_NAMES: Record<string, string> = {
  author: 'Author',
  reviewer: 'Reviewers',
  collaborativeReviewer: 'Collaborative Reviewers',
  handlingEditor: 'Handling Editor',
  editor: 'Editor',
  groupManager: 'Group Manager',
  groupAdmin: 'Group Admin',
}

const addToTeam = async (
  objectId: string,
  objectType: string,
  role: string,
  userId: string,
  memberFields: Record<string, unknown> = {},
): Promise<void> => {
  const team =
    (await Team.findOne({ objectId, role })) ||
    (await Team.insert({
      objectId,
      objectType,
      role,
      displayName: DISPLAY_NAMES[role],
    }))

  await TeamMember.insert({ teamId: team.id, userId, ...memberFields })
}

const run = async (
  username: string,
  query: ReturnType<typeof gql>,
  variables: Record<string, unknown> = {},
): Promise<{
  data?: Record<string, unknown> | null
  errors?: readonly unknown[]
}> => {
  const gqlServer = await createGraphqlTestServer()

  const result = await gqlServer.executeOperation(
    { query, variables },
    {
      contextValue: {
        userId: fixture.users[username],
        req: { headers: { 'group-id': fixture.groupId } },
      },
    },
  )

  if (result.body.kind !== 'single') {
    throw new Error('Expected single result, got incremental')
  }

  return result.body.singleResult
}

// Denied items come back as null (with an error), since Review.id/File.id are non-null
const idsOf = (items?: ({ id: string } | null)[] | null): string[] =>
  (items ?? []).filter(Boolean).map(item => (item as { id: string }).id)

const visibleViaManuscripts = async (
  username: string,
): Promise<{ reviews: string[]; files: string[] }> => {
  const { data } = await run(username, MANUSCRIPTS)

  const manuscript = (
    data?.manuscripts as {
      id: string
      reviews: { id: string }[]
      files: { id: string }[]
    }[]
  ).find(m => m.id === fixture.manuscriptId)

  return {
    reviews: idsOf(manuscript?.reviews).sort(),
    files: idsOf(manuscript?.files),
  }
}

describe('File and Review permissions', () => {
  beforeAll(async () => {
    await config.init()
    db.init()
    await migrationManager.migrate()

    const group = await Group.insert({ name: 'permissions-test' })

    const groupConfig = await Config.query().insert({
      active: true,
      groupId: group.id,
      formData: { instanceName: 'journal' },
    })

    await seedForms(group, groupConfig, {})

    const usernames = [
      'author',
      'reviewer',
      'completedReviewer',
      'invitedReviewer',
      'declinedReviewer',
      'collaborativeReviewer',
      'laterVersionReviewer',
      'editor',
      'editorOfOtherManuscript',
      'reviewerOfOtherManuscript',
      'authorOfOtherManuscript',
      'groupManager',
      'groupAdmin',
      'admin',
      'noRole',
    ]

    const users: Record<string, string> = Object.fromEntries(
      await Promise.all(
        usernames.map(async username => [
          username,
          (await User.insert({ username, email: `${username}@example.com` }))
            .id,
        ]),
      ),
    )

    // 'accepted' so reviews are visible to the author (no decision, no reviews)
    const manuscript = await Manuscript.insert({
      groupId: group.id,
      submitterId: users.author,
      status: 'accepted',
      meta: {},
      submission: {},
    })

    const version = await Manuscript.insert({
      groupId: group.id,
      parentId: manuscript.id,
      submitterId: users.author,
      status: 'new',
      meta: {},
      submission: {},
    })

    const otherManuscript = await Manuscript.insert({
      groupId: group.id,
      submitterId: users.authorOfOtherManuscript,
      status: 'new',
      meta: {},
      submission: {},
    })

    const ms = manuscript.id
    await addToTeam(ms, 'manuscript', 'author', users.author)
    await addToTeam(ms, 'manuscript', 'reviewer', users.reviewer, {
      status: 'accepted',
    })
    await addToTeam(ms, 'manuscript', 'reviewer', users.completedReviewer, {
      status: 'completed',
    })
    await addToTeam(ms, 'manuscript', 'reviewer', users.invitedReviewer, {
      status: 'invited',
    })
    await addToTeam(ms, 'manuscript', 'reviewer', users.declinedReviewer, {
      status: 'rejected',
    })
    await addToTeam(
      ms,
      'manuscript',
      'collaborativeReviewer',
      users.collaborativeReviewer,
      { status: 'accepted' },
    )
    await addToTeam(ms, 'manuscript', 'handlingEditor', users.editor)

    await addToTeam(
      version.id,
      'manuscript',
      'reviewer',
      users.laterVersionReviewer,
      { status: 'accepted' },
    )

    const other = otherManuscript.id
    await addToTeam(
      other,
      'manuscript',
      'author',
      users.authorOfOtherManuscript,
    )
    await addToTeam(
      other,
      'manuscript',
      'editor',
      users.editorOfOtherManuscript,
    )
    await addToTeam(
      other,
      'manuscript',
      'reviewer',
      users.reviewerOfOtherManuscript,
      {
        status: 'accepted',
      },
    )

    await addToTeam(group.id, 'Group', 'groupManager', users.groupManager)
    await addToTeam(group.id, 'Group', 'groupAdmin', users.groupAdmin)

    const adminTeam =
      (await Team.findOne({ role: 'admin', global: true })) ||
      (await Team.insert({ role: 'admin', global: true, displayName: 'Admin' }))

    await TeamMember.insert({ teamId: adminTeam.id, userId: users.admin })

    const review = await Review.insert({
      manuscriptId: ms,
      userId: users.reviewer,
      isDecision: false,
      isHiddenFromAuthor: false,
      isHiddenReviewerName: false,
      jsonData: '{}',
    })

    const decision = await Review.insert({
      manuscriptId: ms,
      userId: users.editor,
      isDecision: true,
      isHiddenFromAuthor: false,
      isHiddenReviewerName: false,
      jsonData: '{}',
    })

    const manuscriptFile = await File.query().insert({
      name: 'manuscript.txt',
      objectId: ms,
      tags: ['supplementary'],
      storedObjects: [],
    })

    const reviewFile = await File.query().insert({
      name: 'review-attachment.txt',
      objectId: review.id,
      tags: ['reviewAttachment'],
      storedObjects: [],
    })

    const groupFile = await File.query().insert({
      name: 'template.css',
      objectId: group.id,
      tags: [],
      storedObjects: [],
    })

    fixture = {
      groupId: group.id,
      manuscriptId: ms,
      versionId: version.id,
      reviewId: review.id,
      decisionId: decision.id,
      manuscriptFileId: manuscriptFile.id,
      reviewFileId: reviewFile.id,
      groupFileId: groupFile.id,
      users,
    }
  })

  afterAll(async () => {
    await DbTestUtils.clearDb()
    await db.destroy()
  })

  const allowed = [
    'author',
    'reviewer',
    'completedReviewer',
    'invitedReviewer',
    'collaborativeReviewer',
    'laterVersionReviewer',
    'editor',
    'editorOfOtherManuscript', // userIsEditorOfAnyManuscript
    'groupManager',
    'groupAdmin',
    'admin',
  ]

  const denied = [
    'noRole',
    'declinedReviewer',
    'authorOfOtherManuscript',
    // Previously let through by reviewIsByUser
    'reviewerOfOtherManuscript',
  ]

  it.each(allowed)('%s can see the reviews and files', async username => {
    const { reviews, files } = await visibleViaManuscripts(username)

    expect(reviews).toEqual([fixture.reviewId, fixture.decisionId].sort())
    expect(files).toEqual([fixture.manuscriptFileId])
  })

  it.each(denied)('%s cannot see the reviews or files', async username => {
    const { reviews, files } = await visibleViaManuscripts(username)

    expect(reviews).toEqual([])
    expect(files).toEqual([])
  })

  it.each(allowed)(
    '%s can fetch a file attached to a review',
    async username => {
      const { data } = await run(username, SPECIFIC_FILES, {
        ids: [fixture.reviewFileId],
      })

      expect(idsOf(data?.getSpecificFiles as { id: string }[])).toEqual([
        fixture.reviewFileId,
      ])
    },
  )

  it.each(denied)(
    '%s cannot fetch a file attached to a review',
    async username => {
      const { data, errors } = await run(username, SPECIFIC_FILES, {
        ids: [fixture.reviewFileId],
      })

      expect(idsOf(data?.getSpecificFiles as { id: string }[])).toEqual([])
      expect(errors?.length).toBeGreaterThan(0)
    },
  )

  it('any group user can fetch files owned by the group', async () => {
    const { data, errors } = await run('noRole', SPECIFIC_FILES, {
      ids: [fixture.groupFileId],
    })

    expect(errors).toBeUndefined()
    expect(idsOf(data?.getSpecificFiles as { id: string }[])).toEqual([
      fixture.groupFileId,
    ])
  })

  it("a later version's reviewer sees earlier versions' reviews and files", async () => {
    const { data, errors } = await run('laterVersionReviewer', MANUSCRIPT, {
      id: fixture.versionId,
    })

    expect(errors).toBeUndefined()

    const versions = (
      data?.manuscript as {
        manuscriptVersions: {
          id: string
          reviews: { id: string }[]
          files: { id: string }[]
        }[]
      }
    ).manuscriptVersions

    const firstVersion = versions.find(v => v.id === fixture.manuscriptId)
    expect(idsOf(firstVersion?.files)).toEqual([fixture.manuscriptFileId])
    // Not a reviewer of that version, so only what an author would see
    expect(idsOf(firstVersion?.reviews).sort()).toEqual(
      [fixture.reviewId, fixture.decisionId].sort(),
    )
  })
})

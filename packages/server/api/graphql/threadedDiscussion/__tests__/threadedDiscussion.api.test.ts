import { randomUUID } from 'crypto'
import { describe, afterEach, beforeAll, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import {
  createGraphqlTestServer,
  migrationManager,
  db,
  config,
  DbTestUtils,
} from '@coko/server'

import {
  Group,
  User,
  Manuscript,
  Team,
  Config,
  ThreadedDiscussion,
} from '../../../../models'

// Who may add and edit threaded discussion comments is decided in
// threadedDiscussion.controllers.js: authors, editors, Group Managers and
// Group Admins may comment; editing also needs
// controlPanel.editorsEditDiscussionPostsEnabled. A global Admin with no
// other role is deliberately excluded.

const UPDATE_PENDING_COMMENT = gql`
  mutation (
    $manuscriptId: ID!
    $threadedDiscussionId: ID!
    $threadId: ID!
    $commentId: ID!
    $comment: String
    $manuscriptVersionId: ID
  ) {
    updatePendingComment(
      manuscriptId: $manuscriptId
      threadedDiscussionId: $threadedDiscussionId
      threadId: $threadId
      commentId: $commentId
      comment: $comment
      manuscriptVersionId: $manuscriptVersionId
    ) {
      id
    }
  }
`

const COMPLETE_COMMENT = gql`
  mutation ($threadedDiscussionId: ID!, $threadId: ID!, $commentId: ID!) {
    completeComment(
      threadedDiscussionId: $threadedDiscussionId
      threadId: $threadId
      commentId: $commentId
    ) {
      id
    }
  }
`

const COMPLETE_COMMENTS = gql`
  mutation ($threadedDiscussionId: ID!) {
    completeComments(threadedDiscussionId: $threadedDiscussionId) {
      id
    }
  }
`

const THREADED_DISCUSSIONS = gql`
  query ($manuscriptId: ID!) {
    threadedDiscussions(manuscriptId: $manuscriptId) {
      id
      userCanAddComment
      userCanEditOwnComment
      userCanEditAnyComment
    }
  }
`

type Fixture = {
  group: Group
  manuscript: Manuscript
  adminId: string
  groupAdminId: string
  editorId: string
}

type StoredComment = {
  id: string
  commentVersions: { userId: string; comment: string }[]
  pendingVersions: { userId: string; comment: string }[]
}

const setUp = async ({
  editorsEditDiscussionPostsEnabled = true,
} = {}): Promise<Fixture> => {
  const group = await Group.insert({})

  await Config.query().insert({
    active: true,
    groupId: group.id,
    formData: { controlPanel: { editorsEditDiscussionPostsEnabled } },
  })

  const manuscript = await Manuscript.insert({
    groupId: group.id,
    submission: {},
    meta: {},
  })

  const [admin, groupAdmin, editor] = await Promise.all([
    User.insert({}),
    User.insert({}),
    User.insert({}),
  ])

  // Migrations seed the global admin team (unique per role), but clearDb
  // removes it after the first test
  const adminTeam =
    (await Team.findOne({ role: 'admin', global: true })) ??
    (await Team.insert({ role: 'admin', displayName: 'Admin', global: true }))

  const groupAdminTeam = await Team.insert({
    role: 'groupAdmin',
    displayName: 'Group Admin',
    objectId: group.id,
    objectType: 'Group',
  })

  const editorTeam = await Team.insert({
    role: 'editor',
    displayName: 'Editor',
    objectId: manuscript.id,
    objectType: 'manuscript',
  })

  await Team.addMember(adminTeam.id, admin.id)
  await Team.addMember(groupAdminTeam.id, groupAdmin.id)
  await Team.addMember(editorTeam.id, editor.id)

  return {
    group,
    manuscript,
    adminId: admin.id,
    groupAdminId: groupAdmin.id,
    editorId: editor.id,
  }
}

// Stored in the same shape threadedDiscussion.controllers.js writes.
const insertDiscussion = async (
  manuscriptId: string,
  comments: StoredComment[],
): Promise<{ threadedDiscussionId: string; threadId: string }> => {
  const now = new Date().toISOString()
  const threadId = randomUUID()

  const discussion = await ThreadedDiscussion.query().insertAndFetch({
    manuscriptId,
    threads: JSON.stringify([
      {
        id: threadId,
        created: now,
        updated: now,
        comments: comments.map(c => ({
          ...c,
          manuscriptVersionId: manuscriptId,
          created: now,
          updated: now,
          commentVersions: c.commentVersions.map(v => ({
            id: randomUUID(),
            created: now,
            updated: now,
            ...v,
          })),
          pendingVersions: c.pendingVersions.map(v => ({
            created: now,
            updated: now,
            ...v,
          })),
        })),
      },
    ]),
  })

  return { threadedDiscussionId: discussion.id, threadId }
}

const storedComments = async (
  threadedDiscussionId: string,
): Promise<StoredComment[]> => {
  const discussion =
    await ThreadedDiscussion.query().findById(threadedDiscussionId)

  return discussion.threads[0].comments
}

const execute = async (
  query: ReturnType<typeof gql>,
  variables: Record<string, unknown>,
  userId: string,
  groupId: string,
): Promise<{ data?: Record<string, any> | null; errors?: string[] }> => {
  const gqlServer = await createGraphqlTestServer()

  const result = await gqlServer.executeOperation(
    { query, variables },
    {
      contextValue: {
        userId,
        req: { headers: { 'group-id': groupId } },
      },
    },
  )

  if (result.body.kind !== 'single') {
    throw new Error('Expected single result, got incremental')
  }

  const { data, errors } = result.body.singleResult

  return { data, errors: errors?.map(e => e.message) }
}

describe('Threaded discussion API', () => {
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
    await db.destroy()
  })

  describe('updatePendingComment', () => {
    it('refuses a global Admin starting a discussion, and creates nothing', async () => {
      const { group, manuscript, adminId } = await setUp()
      const threadedDiscussionId = randomUUID()

      const { errors } = await execute(
        UPDATE_PENDING_COMMENT,
        {
          manuscriptId: manuscript.id,
          threadedDiscussionId,
          threadId: randomUUID(),
          commentId: randomUUID(),
          comment: '<p>Admin comment</p>',
          manuscriptVersionId: manuscript.id,
        },
        adminId,
        group.id,
      )

      expect(errors).toContain('Not Authorised!')
      expect(
        await ThreadedDiscussion.query().findById(threadedDiscussionId),
      ).toBeUndefined()
    })

    it('refuses a global Admin editing an existing comment', async () => {
      const { group, manuscript, adminId, groupAdminId } = await setUp()
      const commentId = randomUUID()

      const { threadedDiscussionId, threadId } = await insertDiscussion(
        manuscript.id,
        [
          {
            id: commentId,
            commentVersions: [{ userId: groupAdminId, comment: '<p>Hi</p>' }],
            pendingVersions: [],
          },
        ],
      )

      const { errors } = await execute(
        UPDATE_PENDING_COMMENT,
        {
          manuscriptId: manuscript.id,
          threadedDiscussionId,
          threadId,
          commentId,
          comment: '<p>Admin edit</p>',
          manuscriptVersionId: manuscript.id,
        },
        adminId,
        group.id,
      )

      expect(errors).toContain('Not Authorised!')

      const [comment] = await storedComments(threadedDiscussionId)
      expect(comment.pendingVersions).toEqual([])
    })

    it('lets a Group Admin start a discussion', async () => {
      const { group, manuscript, groupAdminId } = await setUp()
      const threadedDiscussionId = randomUUID()

      const { errors } = await execute(
        UPDATE_PENDING_COMMENT,
        {
          manuscriptId: manuscript.id,
          threadedDiscussionId,
          threadId: randomUUID(),
          commentId: randomUUID(),
          comment: '<p>Group Admin comment</p>',
          manuscriptVersionId: manuscript.id,
        },
        groupAdminId,
        group.id,
      )

      expect(errors).toBeUndefined()

      const [comment] = await storedComments(threadedDiscussionId)
      expect(comment.pendingVersions).toMatchObject([
        { userId: groupAdminId, comment: '<p>Group Admin comment</p>' },
      ])
    })

    it('lets an editor edit their own comment when editing is enabled', async () => {
      const { group, manuscript, editorId } = await setUp()
      const commentId = randomUUID()

      const { threadedDiscussionId, threadId } = await insertDiscussion(
        manuscript.id,
        [
          {
            id: commentId,
            commentVersions: [{ userId: editorId, comment: '<p>Mine</p>' }],
            pendingVersions: [],
          },
        ],
      )

      const { errors } = await execute(
        UPDATE_PENDING_COMMENT,
        {
          manuscriptId: manuscript.id,
          threadedDiscussionId,
          threadId,
          commentId,
          comment: '<p>Mine, edited</p>',
          manuscriptVersionId: manuscript.id,
        },
        editorId,
        group.id,
      )

      expect(errors).toBeUndefined()
    })

    it('refuses an editor editing their own comment when editing is disabled', async () => {
      const { group, manuscript, editorId } = await setUp({
        editorsEditDiscussionPostsEnabled: false,
      })

      const commentId = randomUUID()

      const { threadedDiscussionId, threadId } = await insertDiscussion(
        manuscript.id,
        [
          {
            id: commentId,
            commentVersions: [{ userId: editorId, comment: '<p>Mine</p>' }],
            pendingVersions: [],
          },
        ],
      )

      const { errors } = await execute(
        UPDATE_PENDING_COMMENT,
        {
          manuscriptId: manuscript.id,
          threadedDiscussionId,
          threadId,
          commentId,
          comment: '<p>Mine, edited</p>',
          manuscriptVersionId: manuscript.id,
        },
        editorId,
        group.id,
      )

      expect(errors).toContain('Not Authorised!')
    })
  })

  describe('completeComment', () => {
    // The state the bug left behind: a draft by an Admin, saved before they
    // were stopped from commenting.
    const insertAdminDraft = async (
      manuscriptId: string,
      adminId: string,
    ): Promise<{
      threadedDiscussionId: string
      threadId: string
      commentId: string
    }> => {
      const commentId = randomUUID()

      const ids = await insertDiscussion(manuscriptId, [
        {
          id: commentId,
          commentVersions: [],
          pendingVersions: [{ userId: adminId, comment: '<p>Stale draft</p>' }],
        },
      ])

      return { ...ids, commentId }
    }

    it("refuses to submit a global Admin's leftover draft", async () => {
      const { group, manuscript, adminId } = await setUp()

      const ids = await insertAdminDraft(manuscript.id, adminId)

      const { errors } = await execute(COMPLETE_COMMENT, ids, adminId, group.id)

      expect(errors).toContain('Not Authorised!')

      const [comment] = await storedComments(ids.threadedDiscussionId)
      expect(comment.commentVersions).toEqual([])
    })

    it('lets a Group Admin submit their draft', async () => {
      const { group, manuscript, groupAdminId } = await setUp()
      const commentId = randomUUID()

      const { threadedDiscussionId, threadId } = await insertDiscussion(
        manuscript.id,
        [
          {
            id: commentId,
            commentVersions: [],
            pendingVersions: [
              { userId: groupAdminId, comment: '<p>Group Admin draft</p>' },
            ],
          },
        ],
      )

      const { errors } = await execute(
        COMPLETE_COMMENT,
        { threadedDiscussionId, threadId, commentId },
        groupAdminId,
        group.id,
      )

      expect(errors).toBeUndefined()

      const [comment] = await storedComments(threadedDiscussionId)
      expect(comment.commentVersions).toMatchObject([
        { userId: groupAdminId, comment: '<p>Group Admin draft</p>' },
      ])
      expect(comment.pendingVersions).toEqual([])
    })

    // completeComments runs when the decision form is submitted, so it must
    // not fail outright over a stray draft.
    it("completeComments skips a global Admin's draft without failing", async () => {
      const { group, manuscript, adminId } = await setUp()

      const { threadedDiscussionId } = await insertAdminDraft(
        manuscript.id,
        adminId,
      )

      const { errors } = await execute(
        COMPLETE_COMMENTS,
        { threadedDiscussionId },
        adminId,
        group.id,
      )

      expect(errors).toBeUndefined()

      const [comment] = await storedComments(threadedDiscussionId)
      expect(comment.commentVersions).toEqual([])
      expect(comment.pendingVersions).toHaveLength(1)
    })
  })

  // Closing the edit modal flushes the editor's debounced save at the same
  // moment "Save edit" submits. Both rewrite the whole discussion, so without
  // locking the stale save could overwrite the submitted edit.
  describe('concurrent writes', () => {
    it('a draft save racing completeComment does not lose the submitted edit', async () => {
      const { group, manuscript, editorId } = await setUp()
      const commentId = randomUUID()

      const { threadedDiscussionId, threadId } = await insertDiscussion(
        manuscript.id,
        [
          {
            id: commentId,
            commentVersions: [{ userId: editorId, comment: '<p>Original</p>' }],
            pendingVersions: [{ userId: editorId, comment: '<p>Edited</p>' }],
          },
        ],
      )

      const results = await Promise.all([
        execute(
          COMPLETE_COMMENT,
          { threadedDiscussionId, threadId, commentId },
          editorId,
          group.id,
        ),
        execute(
          UPDATE_PENDING_COMMENT,
          {
            manuscriptId: manuscript.id,
            threadedDiscussionId,
            threadId,
            commentId,
            comment: '<p>Edited</p>',
            manuscriptVersionId: manuscript.id,
          },
          editorId,
          group.id,
        ),
      ])

      expect(results.map(r => r.errors)).toEqual([undefined, undefined])

      const [comment] = await storedComments(threadedDiscussionId)
      expect(comment.commentVersions.map(v => v.comment)).toEqual([
        '<p>Original</p>',
        '<p>Edited</p>',
      ])
    })
  })

  describe('threadedDiscussions permission flags', () => {
    it('are all false for a global Admin and all true for a Group Admin', async () => {
      const { group, manuscript, adminId, groupAdminId } = await setUp()

      await insertDiscussion(manuscript.id, [
        {
          id: randomUUID(),
          commentVersions: [{ userId: groupAdminId, comment: '<p>Hi</p>' }],
          pendingVersions: [],
        },
      ])

      const flagsFor = async (
        userId: string,
      ): Promise<Record<string, boolean>> => {
        const { data } = await execute(
          THREADED_DISCUSSIONS,
          { manuscriptId: manuscript.id },
          userId,
          group.id,
        )

        const { id: _id, ...flags } = data?.threadedDiscussions[0] ?? {}
        return flags
      }

      expect(await flagsFor(adminId)).toEqual({
        userCanAddComment: false,
        userCanEditOwnComment: false,
        userCanEditAnyComment: false,
      })

      expect(await flagsFor(groupAdminId)).toEqual({
        userCanAddComment: true,
        userCanEditOwnComment: true,
        userCanEditAnyComment: true,
      })
    })
  })
})

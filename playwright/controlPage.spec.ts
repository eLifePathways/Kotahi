import { test, expect, type Page } from './utils/fixtures'

// Ports 'Hide review and hide reviewer functionality' from
// cypress/e2e/b-colab-prc/104-control_page_spec.cy.js. Only the reviewer
// name's visibility (what those two tests actually assert) is covered here -
// everything not under test (manuscript, reviewer assignment, the review
// itself) is set up directly via the API rather than by clicking through the
// invite/accept/do-review/submit flow.

test.describe('reviewer name visibility', () => {
  test('review and reviewer name are hidden from the reviewer by default', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const reviewerUsername = testGroup.usernames[0]

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    // isHiddenFromAuthor/isHiddenReviewerName default to true - matches what
    // the app itself sets when a reviewer accepts an invitation (see
    // manuscript.controllers.js).
    await api.createReview({ manuscriptId, username: reviewerUsername })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'completed',
    })

    await loginAs(reviewerUsername)
    await navigateTo(`/versions/${manuscriptId}/review`)

    await page
      .getByTestId('tab-container')
      .getByText('Review', { exact: true })
      .click()

    await expect(page.getByTestId('reviewer-info')).not.toContainText(
      reviewerUsername,
    )
    await expect(page.getByTestId('reviewer-info')).toContainText(
      'Anonymous Reviewer',
    )
  })

  test('review and reviewer name are visible to the reviewer once unhidden', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const reviewerUsername = testGroup.usernames[0]

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.createReview({
      manuscriptId,
      username: reviewerUsername,
      isHiddenFromAuthor: false,
      isHiddenReviewerName: false,
    })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'completed',
    })

    await loginAs(reviewerUsername)
    await navigateTo(`/versions/${manuscriptId}/review`)

    await page
      .getByTestId('tab-container')
      .getByText('Review', { exact: true })
      .click()

    await expect(page.getByTestId('reviewer-info')).toContainText(
      reviewerUsername,
    )
  })
})

// Who can open the Control page, and what they can do with threaded
// discussion comments on its decision form. What the server itself
// allows is covered in packages/server/api/graphql/threadedDiscussion/
// __tests__/threadedDiscussion.api.test.ts.
//
// Roles come from the shared e2e users (see packages/server/api/rest/e2e/
// actions.js): pw-admin holds only the global Admin role, pw-group-admin
// only Group Admin in the test group. Neither holds any manuscript role.

const UNAUTHORISED_MESSAGE = 'This resource is not accessible.'

// The seeded decision form has no threaded discussion, so each test adds one.
// 'discussion' is the field name DecisionVersion.jsx already defaults for.
const DISCUSSION_FIELD = {
  name: 'discussion',
  component: 'ThreadedDiscussion',
  title: 'E2E threaded discussion',
  options: [],
}

const paragraph = (text: string): string => `<p class="paragraph">${text}</p>`

// React render errors (eg. the old "reading 'username'" crash) surface as
// uncaught page errors - collect them so a test can assert there were none.
const collectPageErrors = (page: Page): Error[] => {
  const errors: Error[] = []
  page.on('pageerror', error => errors.push(error))
  return errors
}

type Locator = ReturnType<Page['locator']>

const threadedComment = (page: Page, text: string): Locator =>
  page.getByTestId('threaded-comment').filter({ hasText: text })

const editIcon = (comment: Locator): Locator =>
  comment.getByTestId('edit-comment')

const waitForGraphqlOperation = (
  page: Page,
  operation: string,
): ReturnType<Page['waitForResponse']> =>
  page.waitForResponse(
    response =>
      response.url().includes('/graphql') &&
      !!response.request().postData()?.includes(operation),
  )

test.describe('access and threaded discussions', () => {
  let manuscriptId: string

  test.beforeEach(async ({ api, testGroup }) => {
    // Submitted by a user no test logs in as, so no generic user is
    // accidentally the author.
    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: testGroup.userWithOrcidUsername,
    })

    ;[manuscriptId] = manuscriptIds

    // The Control page query selects manuscript.files, so this exercises the
    // File permission rule as well as Manuscript.
    await api.addManuscriptFile({ manuscriptId })

    await api.updateFormFields({
      purpose: 'decision',
      category: 'decision',
      fields: [DISCUSSION_FIELD],
    })
  })

  const openDecisionTab = async (
    page: Page,
    navigateTo: (path: string) => Promise<unknown>,
  ): Promise<void> => {
    await navigateTo(`/versions/${manuscriptId}/decision?tab=decision`)

    // The Control page loads several slow queries at once - allow for that
    // when tests run in parallel.
    await expect(
      page.getByText(DISCUSSION_FIELD.title, { exact: true }),
    ).toBeVisible({ timeout: 15000 })
  }

  test.describe('access', () => {
    test('a global Admin with no group role can open it', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const pageErrors = collectPageErrors(page)
      await loginAs(testGroup.adminUsername)
      await openDecisionTab(page, navigateTo)

      await expect(page.getByText(UNAUTHORISED_MESSAGE)).toBeHidden()
      expect(pageErrors).toEqual([])
    })

    test('a Group Admin with no other role can open it', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const pageErrors = collectPageErrors(page)
      await loginAs(testGroup.groupAdminUsername)
      await openDecisionTab(page, navigateTo)

      await expect(page.getByText(UNAUTHORISED_MESSAGE)).toBeHidden()
      expect(pageErrors).toEqual([])
    })

    test('a Group Manager can open it', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      await loginAs(testGroup.groupManagerUsername)
      await openDecisionTab(page, navigateTo)

      await expect(page.getByText(UNAUTHORISED_MESSAGE)).toBeHidden()
    })

    test('a user with no role on the manuscript is still refused', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      await loginAs(testGroup.usernames[1])
      await navigateTo(`/versions/${manuscriptId}/decision`)

      await expect(page.getByText(UNAUTHORISED_MESSAGE)).toBeVisible()
    })
  })

  test.describe('threaded discussion as a global Admin', () => {
    test('existing comments are read-only, with no edit icon or new comment box', async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      // Editing enabled, so the only thing withholding the edit icon is the
      // Admin's lack of a scoped role.
      await api.updateGroupConfig({
        controlPanel: { editorsEditDiscussionPostsEnabled: true },
      })

      await api.createThreadedDiscussion({
        manuscriptId,
        fieldName: DISCUSSION_FIELD.name,
        comments: [
          {
            username: testGroup.groupManagerUsername,
            comment: paragraph('Comment by the Group Manager'),
          },
        ],
      })

      const pageErrors = collectPageErrors(page)
      await loginAs(testGroup.adminUsername)
      await openDecisionTab(page, navigateTo)

      const comment = threadedComment(page, 'Comment by the Group Manager')
      await expect(comment).toBeVisible()
      await expect(editIcon(comment)).toHaveCount(0)
      await expect(page.getByTestId('new-threaded-comment')).toHaveCount(0)
      expect(pageErrors).toEqual([])
    })

    test('cannot start a new discussion', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      // No discussion exists yet - this path used userCanAddThread: true
      // regardless of role.
      await loginAs(testGroup.adminUsername)
      await openDecisionTab(page, navigateTo)

      await expect(page.getByTestId('new-threaded-comment')).toHaveCount(0)
      await expect(
        page.getByRole('button', { name: 'Submit comment' }),
      ).toHaveCount(0)
    })

    test('a leftover unsubmitted draft is not shown as an open editor', async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      // The state the bug left behind: a draft by an Admin, saved before
      // they were stopped from commenting.
      await api.createThreadedDiscussion({
        manuscriptId,
        fieldName: DISCUSSION_FIELD.name,
        comments: [
          {
            username: testGroup.groupManagerUsername,
            comment: paragraph('Submitted comment'),
          },
        ],
        pendingComments: [
          {
            username: testGroup.adminUsername,
            comment: paragraph('Stale Admin draft'),
          },
        ],
      })

      await loginAs(testGroup.adminUsername)
      await openDecisionTab(page, navigateTo)

      await expect(threadedComment(page, 'Submitted comment')).toBeVisible()
      await expect(page.getByTestId('new-threaded-comment')).toHaveCount(0)
      await expect(page.getByText('Stale Admin draft')).toHaveCount(0)
    })
  })

  test.describe('threaded discussion as a Group Admin', () => {
    test('can add a comment', async ({
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      await loginAs(testGroup.groupAdminUsername)
      await openDecisionTab(page, navigateTo)

      const newComment = page.getByTestId('new-threaded-comment')
      await expect(newComment).toBeVisible()

      const savedDraft = waitForGraphqlOperation(page, 'updatePendingComment')
      await newComment.locator('.ProseMirror[contenteditable="true"]').click()
      await page.keyboard.type('Comment by the Group Admin')
      await savedDraft

      // A new discussion is linked to the decision record by the form's own
      // debounced save (updateReview) - wait for it, or a reload drops it.
      const linked = waitForGraphqlOperation(page, 'updateReview')
      const completed = waitForGraphqlOperation(page, 'completeComment')
      await newComment.getByRole('button', { name: 'Submit comment' }).click()
      await completed
      await linked

      // Confirm it was stored as a submitted comment, not just shown
      // optimistically.
      await page.reload()
      await expect(
        threadedComment(page, 'Comment by the Group Admin'),
      ).toBeVisible()
    })
  })

  test.describe('editing a submitted comment', () => {
    test.beforeEach(async ({ api, testGroup }) => {
      await api.assignRole({
        username: testGroup.usernames[0],
        role: 'editor',
        manuscriptIds: [manuscriptId],
      })
    })

    test('an editor can edit their comment, and reloading mid-edit does not crash', async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const editor = testGroup.usernames[0]

      await api.updateGroupConfig({
        controlPanel: { editorsEditDiscussionPostsEnabled: true },
      })

      await api.createThreadedDiscussion({
        manuscriptId,
        fieldName: DISCUSSION_FIELD.name,
        comments: [{ username: editor, comment: paragraph('Original text') }],
      })

      const pageErrors = collectPageErrors(page)
      await loginAs(editor)
      await openDecisionTab(page, navigateTo)

      const comment = threadedComment(page, 'Original text')
      await expect(editIcon(comment)).toBeVisible()
      await editIcon(comment).click()

      const modal = page.locator('.ReactModal__Content')
      const modalEditor = modal.locator('.ProseMirror[contenteditable="true"]')

      // Typing saves a pending version of the existing comment - the state
      // that used to crash the page on the next render.
      const savedDraft = waitForGraphqlOperation(page, 'updatePendingComment')
      await modalEditor.click()
      await page.keyboard.press('ControlOrMeta+A')
      await page.keyboard.type('Edited text')
      await savedDraft

      await page.reload()
      await expect(
        page.getByText(DISCUSSION_FIELD.title, { exact: true }),
      ).toBeVisible()
      await expect(threadedComment(page, 'Original text')).toBeVisible()
      expect(pageErrors).toEqual([])

      // And finishing the edit still works.
      await editIcon(threadedComment(page, 'Original text')).click()
      await modalEditor.click()
      await page.keyboard.press('ControlOrMeta+A')
      await page.keyboard.type('Edited text')

      const completed = waitForGraphqlOperation(page, 'completeComment')
      await modal.getByRole('button', { name: 'Save edit' }).click()
      await completed

      await page.reload()
      await expect(threadedComment(page, 'Edited text')).toBeVisible()
      expect(pageErrors).toEqual([])
    })

    test("a pending edit of someone else's comment keeps the original author", async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const editor = testGroup.usernames[0]

      await api.updateGroupConfig({
        controlPanel: { editorsEditDiscussionPostsEnabled: true },
      })

      await api.createThreadedDiscussion({
        manuscriptId,
        fieldName: DISCUSSION_FIELD.name,
        comments: [
          {
            username: testGroup.groupManagerUsername,
            comment: paragraph('Group Manager comment'),
          },
        ],
        pendingComments: [
          {
            username: editor,
            comment: paragraph('Editor edit in progress'),
            commentIndex: 0,
          },
        ],
      })

      const pageErrors = collectPageErrors(page)
      await loginAs(editor)
      await openDecisionTab(page, navigateTo)

      // The header used to show the person editing, which also made
      // "edit own comment" treat them as the owner.
      const comment = threadedComment(page, 'Group Manager comment')
      await expect(comment).toContainText(testGroup.groupManagerUsername)
      await expect(comment).not.toContainText(editor)
      expect(pageErrors).toEqual([])
    })

    test('with editing switched off, an editor sees no edit icon', async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const editor = testGroup.usernames[0]

      await api.updateGroupConfig({
        controlPanel: { editorsEditDiscussionPostsEnabled: false },
      })

      await api.createThreadedDiscussion({
        manuscriptId,
        fieldName: DISCUSSION_FIELD.name,
        comments: [{ username: editor, comment: paragraph('Locked comment') }],
      })

      await loginAs(editor)
      await openDecisionTab(page, navigateTo)

      const comment = threadedComment(page, 'Locked comment')
      await expect(comment).toBeVisible()
      await expect(editIcon(comment)).toHaveCount(0)
    })
  })
})

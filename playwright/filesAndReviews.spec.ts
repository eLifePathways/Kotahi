import { test, expect, type Page } from './utils/fixtures'

// Who sees a manuscript's files and reviews in the app: the File and Review
// permission rules in packages/server/permissions.js. Those rules return
// null for anything the user may not see, so a page whose user lost access
// either leaves content out or crashes - hence also asserting there are no
// uncaught page errors. What the API refuses is covered in
// packages/server/api/graphql/review/__tests__/
// filesAndReviews.permissions.api.test.ts.

const FILE_NAME = 'e2e-supplementary.txt'

const paragraph = (text: string): string => `<p class="paragraph">${text}</p>`

const collectPageErrors = (page: Page): Error[] => {
  const errors: Error[] = []
  page.on('pageerror', error => errors.push(error))
  return errors
}

test.describe('files and reviews', () => {
  test('the author sees the decision, the reviews and the files on their submission', async ({
    api,
    page,
    loginAs,
    navigateTo,
    testGroup,
  }) => {
    // Not a shared user: those are reviewers elsewhere, and being a reviewer
    // of any manuscript used to be enough to see every review
    const { username: author } = await api.createGroupUser('author')
    const [hiddenReviewer, editor] = testGroup.usernames
    // Shown by name, which assumes a default (ORCID) identity - every real
    // user has one, but the generic pw-user-* users don't
    const reviewer = testGroup.userWithOrcidUsername

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: author,
    })

    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: editor,
      role: 'handlingEditor',
      manuscriptIds: [manuscriptId],
    })

    await Promise.all(
      [reviewer, hiddenReviewer].map(username =>
        api.assignRole({
          username,
          role: 'reviewer',
          manuscriptIds: [manuscriptId],
        }),
      ),
    )

    await Promise.all(
      [reviewer, hiddenReviewer].map(username =>
        api.setReviewerStatus({
          manuscriptId,
          username,
          status: 'completed',
        }),
      ),
    )

    await api.createReview({
      manuscriptId,
      username: reviewer,
      isHiddenFromAuthor: false,
      isHiddenReviewerName: false,
      jsonData: { comment: paragraph('A review the author may read') },
    })

    await api.createReview({
      manuscriptId,
      username: hiddenReviewer,
      isHiddenFromAuthor: true,
      jsonData: { comment: paragraph('A review hidden from the author') },
    })

    await api.createDecision({
      manuscriptId,
      username: editor,
      jsonData: {
        comment: paragraph('The decision letter'),
        $verdict: 'accept',
      },
    })

    await api.patchManuscript({
      manuscriptId,
      patch: { status: 'accepted', decision: 'accept' },
    })

    await api.addManuscriptFile({ manuscriptId, filename: FILE_NAME })

    const pageErrors = collectPageErrors(page)
    await loginAs(author)
    await navigateTo(`/versions/${manuscriptId}/submit`)

    await expect(page.getByText('The decision letter')).toBeVisible({
      timeout: 15000,
    })
    // Only the review that isn't hidden from the author is listed, collapsed
    await expect(page.getByText('Review 2', { exact: true })).toBeHidden()
    await page.getByRole('button', { name: 'Show', exact: true }).click()
    await expect(page.getByText('A review the author may read')).toBeVisible()
    await expect(page.getByText(reviewer, { exact: true })).toBeVisible()
    await expect(page.getByText(FILE_NAME)).toBeVisible()
    await expect(page.getByText('A review hidden from the author')).toBeHidden()
    expect(pageErrors).toEqual([])
  })

  for (const status of ['inProgress', 'completed']) {
    test(`a reviewer whose review is ${status} sees the manuscript's files`, async ({
      api,
      page,
      loginAs,
      navigateTo,
      testGroup,
    }) => {
      const [reviewer] = testGroup.usernames

      const { manuscriptIds } = await api.createManuscripts({
        amount: 1,
        submitter: testGroup.userWithOrcidUsername,
      })

      const [manuscriptId] = manuscriptIds

      await api.assignRole({
        username: reviewer,
        role: 'reviewer',
        manuscriptIds: [manuscriptId],
      })

      await api.setReviewerStatus({ manuscriptId, username: reviewer, status })
      await api.createReview({ manuscriptId, username: reviewer })
      await api.addManuscriptFile({ manuscriptId, filename: FILE_NAME })

      const pageErrors = collectPageErrors(page)
      await loginAs(reviewer)
      await navigateTo(`/versions/${manuscriptId}/review`)

      await expect(page.getByText(FILE_NAME)).toBeVisible({ timeout: 15000 })
      expect(pageErrors).toEqual([])
    })
  }

  test("a shared reviewer sees the other shared reviewers' completed reviews", async ({
    api,
    page,
    loginAs,
    navigateTo,
    testGroup,
  }) => {
    const [reviewer, otherReviewer] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: testGroup.userWithOrcidUsername,
    })

    const [manuscriptId] = manuscriptIds

    await Promise.all(
      [reviewer, otherReviewer].map(username =>
        api.assignRole({
          username,
          role: 'reviewer',
          manuscriptIds: [manuscriptId],
        }),
      ),
    )

    await Promise.all(
      [reviewer, otherReviewer].map(username =>
        api.setReviewerStatus({
          manuscriptId,
          username,
          status: 'completed',
          isShared: true,
        }),
      ),
    )

    await api.createReview({
      manuscriptId,
      username: reviewer,
      jsonData: { comment: paragraph('My own review') },
    })

    await api.createReview({
      manuscriptId,
      username: otherReviewer,
      jsonData: { comment: paragraph('A fellow reviewer’s review') },
    })

    const pageErrors = collectPageErrors(page)
    await loginAs(reviewer)
    await navigateTo(`/versions/${manuscriptId}/review`)

    await page
      .getByTestId('tab-container')
      .getByText('Other Reviews', { exact: true })
      .click({ timeout: 15000 })

    await expect(page.getByText('A fellow reviewer’s review')).toBeVisible()
    expect(pageErrors).toEqual([])
  })
})

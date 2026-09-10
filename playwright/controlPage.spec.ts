import { test, expect } from './utils/fixtures'

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

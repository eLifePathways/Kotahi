import { randomUUID } from 'crypto'

import {
  test,
  expect,
  type Api,
  type Locator,
  type Page,
} from './utils/fixtures'
// @ts-expect-error untyped JS module
import esLa from '../packages/client/app/i18n/es-la/translation'
// @ts-expect-error untyped JS module
import fr from '../packages/client/app/i18n/fr/translation'
// @ts-expect-error untyped JS module
import ru from '../packages/client/app/i18n/ru/translation'

const DAY = 24 * 60 * 60 * 1000

const actionCard = (page: Page, label: string, shortId?: number): Locator =>
  page
    .getByRole('link')
    .filter({ hasText: new RegExp(`^${label} #${shortId ?? '\\d+'}(?!\\d)`) })

test.describe('dashboard page shell and greeting', () => {
  test.use({ timezoneId: 'UTC' })

  test('shows the Dashboard heading and greets the current user by name', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(
      page.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeVisible()

    await expect(page.getByText(new RegExp(`, ${username}$`))).toBeVisible()
  })

  const greetingsByTime = [
    { time: '2026-01-15T09:00:00Z', greeting: 'Good morning' },
    { time: '2026-01-15T14:00:00Z', greeting: 'Good afternoon' },
    { time: '2026-01-15T20:00:00Z', greeting: 'Good evening' },
  ]

  greetingsByTime.forEach(({ time, greeting }) => {
    test(`greets with "${greeting}" at ${time.slice(11, 16)}`, async ({
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username] = testGroup.usernames

      await page.clock.setFixedTime(new Date(time))
      await loginAs(username)
      await navigateTo('/dashboard')

      await expect(page.getByText(`${greeting}, ${username}`)).toBeVisible()
    })
  })

  test('shows the all caught up message when nothing needs attention', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(
      page.getByText('There is nothing that needs your attention right now.'),
    ).toBeVisible()
  })

  const expectedSummaries: Record<number, string> = {
    1: '1 submission pending completion, 1 manuscript pending revision, 1 revision pending submission, 1 reviewer invitation waiting on you, 1 review pending, 1 editor decision pending, 1 task almost overdue and 1 task overdue.',
    2: '2 submissions pending completion, 2 manuscripts pending revision, 2 revisions pending submission, 2 reviewer invitations waiting on you, 2 reviews pending, 2 editor decisions pending, 2 tasks almost overdue and 2 tasks overdue.',
  }

  ;[1, 2].forEach(count => {
    test(`summarises ${count} pending item(s) of every action type, joined with commas and "and"`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username, otherUsername] = testGroup.usernames
      const day = 24 * 60 * 60 * 1000

      const patchStatus = (
        manuscriptIds: string[],
        status: string,
      ): Promise<unknown[]> =>
        Promise.all(
          manuscriptIds.map(manuscriptId =>
            api.patchManuscript({ manuscriptId, patch: { status } }),
          ),
        )

      // authorSubmit
      await api.createManuscripts({ amount: count, submitter: username })

      // authorRevise
      const { manuscriptIds: revisedIds } = await api.createManuscripts({
        amount: count,
        submitter: username,
      })

      await patchStatus(revisedIds, 'revise')

      // authorSubmitRevision
      const { manuscriptIds: revisingIds } = await api.createManuscripts({
        amount: count,
        submitter: username,
      })

      await patchStatus(revisingIds, 'revising')

      // reviewerRespond + reviewerSubmit
      const { manuscriptIds: reviewedIds } = await api.createManuscripts({
        amount: count * 2,
        submitter: otherUsername,
      })

      await api.assignRole({
        username,
        role: 'reviewer',
        manuscriptIds: reviewedIds,
      })

      await Promise.all(
        reviewedIds.map((manuscriptId, index) =>
          api.setReviewerStatus({
            manuscriptId,
            username,
            status: index < count ? 'invited' : 'accepted',
          }),
        ),
      )

      // editorDecide
      const { manuscriptIds: editedIds } = await api.createManuscripts({
        amount: count,
        submitter: otherUsername,
      })

      await api.assignRole({
        username,
        role: 'editor',
        manuscriptIds: editedIds,
      })

      await patchStatus(editedIds, 'submitted')

      // taskOverdue + taskAlmostOverdue (on submitted manuscripts, so they
      // don't also produce an authorSubmit card)
      const { manuscriptIds: taskIds } = await api.createManuscripts({
        amount: count * 2,
        submitter: username,
      })

      await patchStatus(taskIds, 'submitted')

      await Promise.all(
        taskIds.map((manuscriptId, index) =>
          api.createTask({
            manuscriptId,
            username,
            dueDate: new Date(
              Date.now() + (index < count ? -day : day),
            ).toISOString(),
          }),
        ),
      )

      await loginAs(username)
      await navigateTo('/dashboard')

      await expect(
        page.getByText(`You have ${count * 8} items that need attention`),
      ).toBeVisible()

      await expect(page.getByText(expectedSummaries[count])).toBeVisible()
    })
  })

  test('uses singular wording for a single pending item', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    await api.createManuscripts({ amount: 1, submitter: username })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(
      page.getByText('You have 1 item that needs attention'),
    ).toBeVisible()

    await expect(
      page.getByText('1 submission pending completion.'),
    ).toBeVisible()
  })
})

test.describe('dashboard action cards', () => {
  type CardSetupResult = { manuscriptId: string; shortId: number }

  type CardCase = {
    type: string
    label: string
    path: string
    setup: (
      api: Api,
      username: string,
      otherUsername: string,
    ) => Promise<CardSetupResult>
  }

  const cardCases: CardCase[] = [
    {
      type: 'authorSubmit',
      label: 'Submit',
      path: 'submit',
      setup: async (api, username): Promise<CardSetupResult> => {
        const {
          manuscriptIds: [manuscriptId],
          shortIds: [shortId],
        } = await api.createManuscripts({ amount: 1, submitter: username })

        return { manuscriptId, shortId }
      },
    },
    {
      type: 'authorRevise',
      label: 'Revise',
      path: 'submit',
      setup: async (api, username): Promise<CardSetupResult> => {
        const {
          manuscriptIds: [manuscriptId],
          shortIds: [shortId],
        } = await api.createManuscripts({ amount: 1, submitter: username })

        await api.patchManuscript({ manuscriptId, patch: { status: 'revise' } })
        return { manuscriptId, shortId }
      },
    },
    {
      type: 'authorSubmitRevision',
      label: 'Submit revision',
      path: 'submit',
      setup: async (api, username): Promise<CardSetupResult> => {
        const {
          manuscriptIds: [manuscriptId],
          shortIds: [shortId],
        } = await api.createManuscripts({ amount: 1, submitter: username })

        await api.patchManuscript({
          manuscriptId,
          patch: { status: 'revising' },
        })

        return { manuscriptId, shortId }
      },
    },
    {
      type: 'reviewerSubmit',
      label: 'Review',
      path: 'review',
      setup: async (api, username, otherUsername): Promise<CardSetupResult> => {
        const {
          manuscriptIds: [manuscriptId],
          shortIds: [shortId],
        } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

        await api.assignRole({
          username,
          role: 'reviewer',
          manuscriptIds: [manuscriptId],
        })

        await api.setReviewerStatus({
          manuscriptId,
          username,
          status: 'accepted',
        })

        return { manuscriptId, shortId }
      },
    },
    {
      type: 'editorDecide',
      label: 'Decide on',
      path: 'decision',
      setup: async (api, username, otherUsername): Promise<CardSetupResult> => {
        const {
          manuscriptIds: [manuscriptId],
          shortIds: [shortId],
        } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

        await api.assignRole({
          username,
          role: 'editor',
          manuscriptIds: [manuscriptId],
        })

        await api.patchManuscript({
          manuscriptId,
          patch: { status: 'submitted' },
        })

        return { manuscriptId, shortId }
      },
    },
  ]

  cardCases.forEach(({ type, label, path, setup }) => {
    test(`${type} card shows its label, short id and title, and links to the manuscript's ${path} page`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username, otherUsername] = testGroup.usernames
      const { manuscriptId, shortId } = await setup(
        api,
        username,
        otherUsername,
      )
      const expectedPath = `/${testGroup.groupName}/versions/${manuscriptId}/${path}`

      await loginAs(username)
      await navigateTo('/dashboard')

      const card = actionCard(page, label, shortId)

      await expect(card).toHaveCount(1)
      await expect(card).toContainText('Test manuscript 1')
      await expect(card).toHaveAttribute('href', expectedPath)

      await card.click()
      await expect(page).toHaveURL(expectedPath)
    })
  })

  test('reviewerRespond card links to the reviews table filtered to invitations', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [invitedManuscriptId, acceptedManuscriptId],
      shortIds: [invitedShortId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    await api.assignRole({
      username,
      role: 'reviewer',
      manuscriptIds: [invitedManuscriptId, acceptedManuscriptId],
    })

    await api.setReviewerStatus({
      manuscriptId: invitedManuscriptId,
      username,
      status: 'invited',
    })

    await api.setReviewerStatus({
      manuscriptId: acceptedManuscriptId,
      username,
      status: 'accepted',
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    const card = actionCard(page, 'Review invitation', invitedShortId)
    const expectedPath = `/${testGroup.groupName}/dashboard/reviews?reviewerStatusBadge=invited`

    await expect(card).toHaveCount(1)
    await expect(card).toContainText('Test manuscript 1')
    await expect(card).toHaveAttribute('href', expectedPath)

    await card.click()
    await expect(page).toHaveURL(expectedPath)

    await expect(
      page.getByText('Your Status: Invited', { exact: true }),
    ).toBeVisible()

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(1)
    await expect(shortIdCells).toHaveText(String(invitedShortId))
  })

  test('no editorDecide card once a decision is made or while the manuscript is still new', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [decidedManuscriptId, newManuscriptId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    await api.assignRole({
      username,
      role: 'editor',
      manuscriptIds: [decidedManuscriptId, newManuscriptId],
    })

    await api.patchManuscript({
      manuscriptId: decidedManuscriptId,
      patch: { status: 'accepted', decision: 'accept' },
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(actionCard(page, 'Decide on')).toHaveCount(0)
  })

  test('task cards link to the manuscript page for the bucket the task falls in', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [editedManuscriptId, reviewedManuscriptId],
      shortIds: [editedShortId, reviewedShortId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    const {
      manuscriptIds: [authoredManuscriptId],
      shortIds: [authoredShortId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    await api.assignRole({
      username,
      role: 'editor',
      manuscriptIds: [editedManuscriptId],
    })

    await api.assignRole({
      username,
      role: 'reviewer',
      manuscriptIds: [reviewedManuscriptId],
    })

    // submitted, so it doesn't also produce an authorSubmit card
    await api.patchManuscript({
      manuscriptId: authoredManuscriptId,
      patch: { status: 'submitted' },
    })

    const overdue = new Date(Date.now() - DAY).toISOString()
    const almostOverdue = new Date(Date.now() + DAY).toISOString()

    await api.createTask({
      manuscriptId: editedManuscriptId,
      username,
      dueDate: overdue,
    })

    await api.createTask({
      manuscriptId: reviewedManuscriptId,
      username,
      dueDate: almostOverdue,
    })

    await api.createTask({
      manuscriptId: authoredManuscriptId,
      username,
      dueDate: overdue,
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    const versionsPath = `/${testGroup.groupName}/versions`

    await expect(
      actionCard(page, 'Task overdue', editedShortId),
    ).toHaveAttribute('href', `${versionsPath}/${editedManuscriptId}/decision`)

    await expect(
      actionCard(page, 'Task almost overdue', reviewedShortId),
    ).toHaveAttribute('href', `${versionsPath}/${reviewedManuscriptId}/review`)

    await expect(
      actionCard(page, 'Task overdue', authoredShortId),
    ).toHaveAttribute('href', `${versionsPath}/${authoredManuscriptId}/submit`)

    await expect(actionCard(page, 'Task overdue')).toHaveCount(2)
    await expect(actionCard(page, 'Task almost overdue')).toHaveCount(1)
  })

  test('no task card for a task due beyond the almost-overdue threshold, or one that is not in progress', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    const {
      manuscriptIds: [laterManuscriptId, doneManuscriptId],
    } = await api.createManuscripts({ amount: 2, submitter: username })

    await Promise.all(
      [laterManuscriptId, doneManuscriptId].map(manuscriptId =>
        api.patchManuscript({ manuscriptId, patch: { status: 'submitted' } }),
      ),
    )

    await api.createTask({
      manuscriptId: laterManuscriptId,
      username,
      dueDate: new Date(Date.now() + 3 * DAY).toISOString(),
    })

    await api.createTask({
      manuscriptId: doneManuscriptId,
      username,
      dueDate: new Date(Date.now() - DAY).toISOString(),
      status: 'Done',
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(page.getByText("You're all caught up")).toBeVisible()
  })

  test('truncates titles longer than 55 characters', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    const longTitle = `${'A long manuscript title that keeps going '.repeat(2)}and on`

    const {
      manuscriptIds: [manuscriptId],
      shortIds: [shortId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $title: longTitle },
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    const card = actionCard(page, 'Submit', shortId)

    await expect(card).toContainText(`${longTitle.slice(0, 55)}...`)
    await expect(card).not.toContainText(longTitle)
  })
})

test.describe('dashboard action card scrolling', () => {
  const scrollLeftButton = (page: Page): Locator =>
    page.getByRole('button', { name: 'Scroll action list left' })

  const scrollRightButton = (page: Page): Locator =>
    page.getByRole('button', { name: 'Scroll action list right' })

  const actionCardList = (page: Page): Locator =>
    page.getByRole('list').filter({ has: actionCard(page, 'Submit') })

  test('shows no scroll buttons when all cards fit', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    await api.createManuscripts({ amount: 2, submitter: username })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(actionCard(page, 'Submit')).toHaveCount(2)
    await expect(scrollLeftButton(page)).toHaveCount(0)
    await expect(scrollRightButton(page)).toHaveCount(0)
  })

  test('scroll buttons appear and disappear as the list is scrolled', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    await api.createManuscripts({ amount: 12, submitter: username })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(actionCard(page, 'Submit')).toHaveCount(12)
    await expect(scrollRightButton(page)).toBeVisible()
    await expect(scrollLeftButton(page)).toHaveCount(0)

    await scrollRightButton(page).click()

    await expect(scrollLeftButton(page)).toBeVisible()
    await expect(scrollRightButton(page)).toBeVisible()

    await actionCardList(page).evaluate(el => {
      el.scrollTo({ left: el.scrollWidth })
    })

    await expect(scrollRightButton(page)).toHaveCount(0)
    await expect(scrollLeftButton(page)).toBeVisible()
  })

  test('recalculates scroll buttons when the viewport is resized', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    await api.createManuscripts({ amount: 4, submitter: username })

    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(actionCard(page, 'Submit')).toHaveCount(4)
    await expect(scrollRightButton(page)).toHaveCount(0)

    await page.setViewportSize({ width: 800, height: 1080 })
    await expect(scrollRightButton(page)).toBeVisible()

    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(scrollRightButton(page)).toHaveCount(0)
  })
})

test.describe('dashboard table cards', () => {
  const tableCard = (page: Page, description: string): Locator =>
    page
      .getByRole('link')
      .filter({ hasText: description })
      .filter({ hasText: /needs? attention/ })

  const tableCards = (page: Page): Locator =>
    page.getByRole('link').filter({ hasText: /needs? attention/ })

  const tableCardCases = [
    {
      description: 'My Submissions',
      typeLabel: 'Author',
      path: 'submissions',
    },
    {
      description: 'Review Assignments',
      typeLabel: 'Reviewer',
      path: 'reviews',
    },
    { description: 'Editing Queue', typeLabel: 'Editor', path: 'edits' },
  ]

  test('shows a card per role with its total and the number of action cards in its bucket', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [, ...submittedIds],
    } = await api.createManuscripts({ amount: 3, submitter: username })

    await Promise.all(
      submittedIds.map(manuscriptId =>
        api.patchManuscript({ manuscriptId, patch: { status: 'submitted' } }),
      ),
    )

    const { manuscriptIds: reviewIds } = await api.createManuscripts({
      amount: 4,
      submitter: otherUsername,
    })

    await api.assignRole({
      username,
      role: 'reviewer',
      manuscriptIds: reviewIds,
    })

    await Promise.all(
      ['invited', 'accepted', 'completed', 'rejected'].map((status, i) =>
        api.setReviewerStatus({
          manuscriptId: reviewIds[i],
          username,
          status,
        }),
      ),
    )

    const {
      manuscriptIds: [decideId, taskId, decidedId],
    } = await api.createManuscripts({ amount: 3, submitter: otherUsername })

    await api.assignRole({
      username,
      role: 'editor',
      manuscriptIds: [decideId, taskId, decidedId],
    })

    await api.patchManuscript({
      manuscriptId: decideId,
      patch: { status: 'submitted' },
    })

    await api.createTask({
      manuscriptId: taskId,
      username,
      dueDate: new Date(Date.now() - DAY).toISOString(),
    })

    await api.patchManuscript({
      manuscriptId: decidedId,
      patch: { status: 'accepted', decision: 'accept' },
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    const expected: Record<string, { total: string; attention: string }> = {
      'My Submissions': { total: '3', attention: '1 needs attention' },
      'Review Assignments': { total: '4', attention: '2 need attention' },
      'Editing Queue': { total: '3', attention: '2 need attention' },
    }

    await expect(tableCards(page)).toHaveCount(3)

    await Promise.all(
      tableCardCases.map(async ({ description, typeLabel }) => {
        const card = tableCard(page, description)
        const { total, attention } = expected[description]

        await expect(card.getByText(typeLabel, { exact: true })).toBeVisible()
        await expect(card.getByText(total, { exact: true })).toBeVisible()
        await expect(card.getByText(attention, { exact: true })).toBeVisible()
      }),
    )
  })

  tableCardCases.forEach(({ description, path }) => {
    test(`${description} card links to /dashboard/${path}`, async ({
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      await loginAs(testGroup.usernames[0])
      await navigateTo('/dashboard')

      const card = tableCard(page, description)
      const expectedPath = `/${testGroup.groupName}/dashboard/${path}`

      await expect(card).toHaveAttribute('href', expectedPath)

      await card.click()
      await expect(page).toHaveURL(expectedPath)

      await expect(
        page.getByRole('heading', { level: 1, name: description }),
      ).toBeVisible()
    })
  })

  test('only shows the sections enabled in showSections, and leaves out action cards for hidden sections', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [authorId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    await api.createTask({
      manuscriptId: authorId,
      username,
      dueDate: new Date(Date.now() - DAY).toISOString(),
    })

    const {
      manuscriptIds: [reviewId, editorId],
      shortIds: [, editorShortId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    await api.assignRole({
      username,
      role: 'reviewer',
      manuscriptIds: [reviewId],
    })

    await api.setReviewerStatus({
      manuscriptId: reviewId,
      username,
      status: 'invited',
    })

    await api.assignRole({
      username,
      role: 'editor',
      manuscriptIds: [editorId],
    })

    await api.patchManuscript({
      manuscriptId: editorId,
      patch: { status: 'submitted' },
    })

    await api.updateGroupConfig({ dashboard: { showSections: ['editor'] } })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(tableCards(page)).toHaveCount(1)
    await expect(tableCard(page, 'Editing Queue')).toBeVisible()

    await expect(actionCard(page, 'Decide on', editorShortId)).toHaveCount(1)
    await expect(actionCard(page, 'Submit')).toHaveCount(0)
    await expect(actionCard(page, 'Review invitation')).toHaveCount(0)
    await expect(actionCard(page, 'Task overdue')).toHaveCount(0)
  })

  test('shows no table cards when showSections is empty, but still renders the rest of the page', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    await api.createManuscripts({ amount: 1, submitter: username })

    await api.updateGroupConfig({ dashboard: { showSections: [] } })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(page.getByText('Activity', { exact: true })).toBeVisible()
    await expect(tableCards(page)).toHaveCount(0)
    await expect(actionCard(page, 'Submit')).toHaveCount(0)
  })
})

test.describe('dashboard activity notifications', () => {
  const notificationRows = (page: Page): Locator =>
    page.getByRole('listitem').filter({ hasText: /manuscript #\d+\./ })

  const clearAllButton = (page: Page): Locator =>
    page.getByRole('button', { name: 'Clear all' })

  const emptyState = (page: Page): Locator => page.getByText('No activity yet')

  const daysAgo = (days: number): string =>
    new Date(Date.now() - days * DAY).toISOString()

  const linkedNotificationCases = [
    {
      eventType: 'addedAsEditor',
      message: 'You were added as an editor on',
      path: 'decision',
    },
    {
      eventType: 'addedAsHandlingEditor',
      message: 'You were added as the handling editor on',
      path: 'decision',
    },
    {
      eventType: 'addedAsSeniorEditor',
      message: 'You were added as the senior editor on',
      path: 'decision',
    },
    {
      eventType: 'addedAsReviewer',
      message: 'You were added as a reviewer on',
      path: 'review',
    },
    {
      eventType: 'reviewerAcceptedInvitation',
      message: 'A reviewer accepted your invitation for',
      path: 'decision',
    },
    {
      eventType: 'reviewerRejectedInvitation',
      message: 'A reviewer declined your invitation for',
      path: 'decision',
    },
    {
      eventType: 'reviewerCompletedReview',
      message: 'A review was completed for',
      path: 'decision',
    },
    {
      eventType: 'decisionMade',
      message: 'A decision was made on',
      path: 'submit',
    },
    {
      eventType: 'revisionSubmitted',
      message: 'A revision was submitted for',
      path: 'decision',
    },
  ]

  const removalNotificationCases = [
    {
      eventType: 'removedAsEditor',
      message: 'You were removed as an editor from',
    },
    {
      eventType: 'removedAsHandlingEditor',
      message: 'You were removed as the handling editor from',
    },
    {
      eventType: 'removedAsSeniorEditor',
      message: 'You were removed as the senior editor from',
    },
    {
      eventType: 'removedAsReviewer',
      message: 'You were removed as a reviewer from',
    },
  ]

  test('shows the empty state and no "Clear all" button when there is no activity', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await expect(emptyState(page)).toBeVisible()
    await expect(
      page.getByText('Updates on your manuscripts will appear here.'),
    ).toBeVisible()
    await expect(clearAllButton(page)).toHaveCount(0)
  })

  linkedNotificationCases.forEach(({ eventType, message, path }) => {
    test(`${eventType} notification shows its message and links to the manuscript's ${path} page`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username, otherUsername] = testGroup.usernames

      const {
        manuscriptIds: [manuscriptId],
        shortIds: [shortId],
      } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

      await api.createUserNotification({ manuscriptId, username, eventType })

      await loginAs(username)
      await navigateTo('/dashboard')

      const row = notificationRows(page)

      await expect(row).toHaveCount(1)
      await expect(row).toContainText(`${message} manuscript #${shortId}.`)
      await expect(row.getByRole('link')).toHaveAttribute(
        'href',
        `/${testGroup.groupName}/versions/${manuscriptId}/${path}`,
      )
    })
  })

  removalNotificationCases.forEach(({ eventType, message }) => {
    test(`${eventType} notification shows its message and has no link`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username, otherUsername] = testGroup.usernames

      const {
        manuscriptIds: [manuscriptId],
        shortIds: [shortId],
      } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

      await api.createUserNotification({ manuscriptId, username, eventType })

      await loginAs(username)
      await navigateTo('/dashboard')

      const row = notificationRows(page)

      await expect(row).toHaveCount(1)
      await expect(row).toContainText(`${message} manuscript #${shortId}.`)
      await expect(row.getByRole('link')).toHaveCount(0)
    })
  })

  const clickCases = [
    {
      eventType: 'addedAsEditor',
      roles: ['editor'],
      submitterIndex: 1,
      path: 'decision',
    },
    {
      eventType: 'addedAsReviewer',
      roles: ['reviewer'],
      submitterIndex: 1,
      path: 'review',
    },
    { eventType: 'decisionMade', roles: [], submitterIndex: 0, path: 'submit' },
  ]

  clickCases.forEach(({ eventType, roles, submitterIndex, path }) => {
    test(`clicking a ${eventType} notification opens the manuscript's ${path} page`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username] = testGroup.usernames

      const {
        manuscriptIds: [manuscriptId],
      } = await api.createManuscripts({
        amount: 1,
        submitter: testGroup.usernames[submitterIndex],
      })

      await Promise.all(
        roles.map(role =>
          api.assignRole({ username, role, manuscriptIds: [manuscriptId] }),
        ),
      )

      await api.createUserNotification({ manuscriptId, username, eventType })

      await loginAs(username)
      await navigateTo('/dashboard')

      await notificationRows(page).getByRole('link').click()

      await expect(page).toHaveURL(
        `/${testGroup.groupName}/versions/${manuscriptId}/${path}`,
      )
    })
  })

  test('shows a relative timestamp on each notification', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [recentId, olderId],
      shortIds: [recentShortId, olderShortId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    await api.createUserNotification({
      manuscriptId: recentId,
      username,
      eventType: 'addedAsEditor',
    })

    await api.createUserNotification({
      manuscriptId: olderId,
      username,
      eventType: 'addedAsEditor',
      created: daysAgo(2),
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(
      notificationRows(page).filter({ hasText: `#${recentShortId}.` }),
    ).toContainText('a few seconds ago')

    await expect(
      notificationRows(page).filter({ hasText: `#${olderShortId}.` }),
    ).toContainText('2 days ago')
  })

  test('lists notifications newest first', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    const notifications = [
      { eventType: 'addedAsReviewer', created: daysAgo(2) },
      { eventType: 'decisionMade', created: daysAgo(1) },
      { eventType: 'addedAsEditor', created: daysAgo(3) },
    ]

    await Promise.all(
      notifications.map(({ eventType, created }) =>
        api.createUserNotification({
          manuscriptId,
          username,
          eventType,
          created,
        }),
      ),
    )

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(notificationRows(page)).toHaveText([
      /^A decision was made on/,
      /^You were added as a reviewer on/,
      /^You were added as an editor on/,
    ])
  })

  test('dismissing a notification removes only that one, and stays dismissed after a reload', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [dismissedId, keptId],
      shortIds: [dismissedShortId, keptShortId],
    } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

    await api.createUserNotification({
      manuscriptId: dismissedId,
      username,
      eventType: 'addedAsEditor',
    })

    await api.createUserNotification({
      manuscriptId: keptId,
      username,
      eventType: 'addedAsEditor',
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(notificationRows(page)).toHaveCount(2)

    await notificationRows(page)
      .filter({ hasText: `#${dismissedShortId}.` })
      .getByRole('button', { name: 'Dismiss notification' })
      .click()

    await expect(notificationRows(page)).toHaveCount(1)
    await expect(notificationRows(page)).toContainText(`#${keptShortId}.`)

    await page.reload()

    await expect(notificationRows(page)).toHaveCount(1)
    await expect(notificationRows(page)).toContainText(`#${keptShortId}.`)
  })

  test('"Clear all" removes every notification, and they stay cleared after a reload', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await Promise.all(
      ['addedAsEditor', 'addedAsReviewer', 'decisionMade'].map(eventType =>
        api.createUserNotification({ manuscriptId, username, eventType }),
      ),
    )

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(notificationRows(page)).toHaveCount(3)

    await clearAllButton(page).click()

    await expect(notificationRows(page)).toHaveCount(0)
    await expect(emptyState(page)).toBeVisible()
    await expect(clearAllButton(page)).toHaveCount(0)

    await page.reload()

    await expect(emptyState(page)).toBeVisible()
    await expect(notificationRows(page)).toHaveCount(0)
  })

  test('new notifications appear without a reload', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
      shortIds: [shortId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(emptyState(page)).toBeVisible()

    await api.createUserNotification({
      manuscriptId,
      username,
      eventType: 'addedAsEditor',
    })

    await expect(notificationRows(page)).toHaveCount(1)
    await expect(notificationRows(page)).toContainText(`#${shortId}.`)
  })

  test('shows at most 30 notifications, with a note giving the total', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await Promise.all(
      Array.from({ length: 31 }, () =>
        api.createUserNotification({
          manuscriptId,
          username,
          eventType: 'addedAsEditor',
        }),
      ),
    )

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(notificationRows(page)).toHaveCount(30)
    await expect(page.getByText('Showing 30 of 31')).toBeVisible()
  })

  test("does not show another user's notifications", async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await api.createUserNotification({
      manuscriptId,
      username: otherUsername,
      eventType: 'addedAsEditor',
    })

    await loginAs(username)
    await navigateTo('/dashboard')

    await expect(emptyState(page)).toBeVisible()
    await expect(notificationRows(page)).toHaveCount(0)
  })
})

test.describe('dashboard sub-route pages', () => {
  const ALL_SECTIONS = ['submission', 'review', 'editor']

  const subRouteCases = [
    { path: 'submissions', heading: 'My Submissions', section: 'submission' },
    { path: 'reviews', heading: 'Review Assignments', section: 'review' },
    { path: 'edits', heading: 'Editing Queue', section: 'editor' },
  ]

  subRouteCases.forEach(({ path, heading, section }) => {
    test(`/dashboard/${path} shows the "${heading}" heading`, async ({
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      await loginAs(testGroup.usernames[0])
      await navigateTo(`/dashboard/${path}`)

      await expect(
        page.getByRole('heading', { level: 1, name: heading }),
      ).toBeVisible()
      await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard/${path}`)
    })

    test(`"Back to Dashboard" on /dashboard/${path} returns to the dashboard`, async ({
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      await loginAs(testGroup.usernames[0])
      await navigateTo(`/dashboard/${path}`)

      await page.getByRole('link', { name: 'Back to Dashboard' }).click()

      await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
      await expect(
        page.getByRole('heading', { level: 1, name: 'Dashboard' }),
      ).toBeVisible()
    })

    test(`/dashboard/${path} redirects to the dashboard when "${section}" is not in showSections`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      await api.updateGroupConfig({
        dashboard: {
          showSections: ALL_SECTIONS.filter(other => other !== section),
        },
      })

      await loginAs(testGroup.usernames[0])
      await navigateTo(`/dashboard/${path}`)

      await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
      await expect(
        page.getByRole('heading', { level: 1, name: 'Dashboard' }),
      ).toBeVisible()
    })
  })
})

test.describe('dashboard keyboard navigation and accessibility', () => {
  const tableCard = (page: Page, description: string): Locator =>
    page
      .getByRole('link')
      .filter({ hasText: description })
      .filter({ hasText: /needs? attention/ })

  const notificationRows = (page: Page): Locator =>
    page.getByRole('listitem').filter({ hasText: /manuscript #\d+\./ })

  const focusStyles = (locator: Locator): Promise<string> =>
    locator.evaluate(el =>
      JSON.stringify(
        [el, ...Array.from(el.querySelectorAll('*'))].map(node => {
          const style = node.ownerDocument.defaultView!.getComputedStyle(node)
          return [style.outlineStyle, style.boxShadow, style.opacity]
        }),
      ),
    )

  const setUpCardsAndNotification = async (
    api: Api,
    username: string,
    otherUsername: string,
  ): Promise<{ authorManuscriptId: string; shortId: number }> => {
    const {
      manuscriptIds: [authorManuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    const {
      manuscriptIds: [manuscriptId],
      shortIds: [shortId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await api.createUserNotification({
      manuscriptId,
      username,
      eventType: 'addedAsEditor',
    })

    return { authorManuscriptId, shortId }
  }

  test('Tab moves through the action cards, table cards, "Clear all", then each notification and its dismiss button, showing a focus indicator on each', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames
    await setUpCardsAndNotification(api, username, otherUsername)

    await loginAs(username)
    await navigateTo('/dashboard')

    const row = notificationRows(page)

    const focusOrder = [
      actionCard(page, 'Submit'),
      tableCard(page, 'My Submissions'),
      tableCard(page, 'Review Assignments'),
      tableCard(page, 'Editing Queue'),
      page.getByRole('button', { name: 'Clear all' }),
      row.getByRole('link'),
      row.getByRole('button', { name: 'Dismiss notification' }),
    ]

    await expect(row).toHaveCount(1)

    const unfocusedStyles = await Promise.all(focusOrder.map(focusStyles))

    await focusOrder[0].focus()
    await expect(focusOrder[0]).toBeFocused()
    await expect
      .poll(() => focusStyles(focusOrder[0]))
      .not.toBe(unfocusedStyles[0])

    for (const [index, target] of focusOrder.slice(1).entries()) {
      // eslint-disable-next-line no-await-in-loop
      await page.keyboard.press('Tab')
      // eslint-disable-next-line no-await-in-loop
      await expect(target).toBeFocused()
      // eslint-disable-next-line no-await-in-loop
      await expect
        .poll(() => focusStyles(target))
        .not.toBe(unfocusedStyles[index + 1])
    }
  })

  test('the scroll buttons sit between the action cards and the table cards in the tab order, and Enter scrolls the list', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames
    await api.createManuscripts({ amount: 12, submitter: username })

    await loginAs(username)
    await navigateTo('/dashboard')

    const scrollRight = page.getByRole('button', {
      name: 'Scroll action list right',
    })

    await expect(scrollRight).toBeVisible()

    await tableCard(page, 'My Submissions').focus()
    await page.keyboard.press('Shift+Tab')
    await expect(scrollRight).toBeFocused()

    await page.keyboard.press('Enter')

    const scrollLeft = page.getByRole('button', {
      name: 'Scroll action list left',
    })

    await expect(scrollLeft).toBeVisible()

    await scrollRight.focus()
    await page.keyboard.press('Shift+Tab')
    await expect(scrollLeft).toBeFocused()

    await page.keyboard.press('Shift+Tab')
    await expect(actionCard(page, 'Submit').last()).toBeFocused()
  })

  test('Enter on a focused action card follows its link', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    await loginAs(username)
    await navigateTo('/dashboard')

    await actionCard(page, 'Submit').focus()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(
      `/${testGroup.groupName}/versions/${manuscriptId}/submit`,
    )
  })

  test('Enter on a focused table card follows its link', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await tableCard(page, 'Editing Queue').focus()
    await page.keyboard.press('Enter')

    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard/edits`)
  })

  const dismissKeys = ['Enter', 'Space']

  dismissKeys.forEach(key => {
    test(`${key} on a focused dismiss button dismisses that notification`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const [username, otherUsername] = testGroup.usernames

      const {
        manuscriptIds: [dismissedId, keptId],
        shortIds: [dismissedShortId, keptShortId],
      } = await api.createManuscripts({ amount: 2, submitter: otherUsername })

      await api.createUserNotification({
        manuscriptId: dismissedId,
        username,
        eventType: 'addedAsEditor',
      })

      await api.createUserNotification({
        manuscriptId: keptId,
        username,
        eventType: 'addedAsEditor',
      })

      await loginAs(username)
      await navigateTo('/dashboard')

      await notificationRows(page)
        .filter({ hasText: `#${dismissedShortId}.` })
        .getByRole('button', { name: 'Dismiss notification' })
        .focus()

      await page.keyboard.press(key)

      await expect(notificationRows(page)).toHaveCount(1)
      await expect(notificationRows(page)).toContainText(`#${keptShortId}.`)
    })
  })

  test('icon-only buttons are named by their aria-label, and their icons are hidden from assistive technology', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames
    await api.createManuscripts({ amount: 12, submitter: username })
    await setUpCardsAndNotification(api, username, otherUsername)

    await loginAs(username)
    await navigateTo('/dashboard')

    const scrollRight = page.getByRole('button', {
      name: 'Scroll action list right',
      exact: true,
    })

    await scrollRight.click()

    const buttons = [
      page.getByRole('button', {
        name: 'Scroll action list left',
        exact: true,
      }),
      scrollRight,
      page.getByRole('button', { name: 'Dismiss notification', exact: true }),
    ]

    for (const button of buttons) {
      // eslint-disable-next-line no-await-in-loop
      await expect(button).toHaveCount(1)
      // eslint-disable-next-line no-await-in-loop
      await expect(button.locator('svg')).not.toHaveCount(0)
      // eslint-disable-next-line no-await-in-loop
      await expect(button.getByRole('img')).toHaveCount(0)
    }

    const clearAll = page.getByRole('button', {
      name: 'Clear all',
      exact: true,
    })

    await expect(clearAll.locator('svg')).not.toHaveCount(0)
    await expect(clearAll.getByRole('img')).toHaveCount(0)
  })
})

test.describe('dashboard error and loading states', () => {
  const COMMS_ERROR = 'Communications error! Please try refreshing the page.'

  const onOperation = (
    page: Page,
    operationName: string,
    handler: (route: Parameters<Parameters<Page['route']>[1]>[0]) => unknown,
  ): Promise<unknown> =>
    page.route('**/graphql', route =>
      route.request().postDataJSON()?.operationName === operationName
        ? handler(route)
        : route.fallback(),
    )

  const deferred = (): { promise: Promise<void>; release: () => void } => {
    let release: () => void = () => {}

    const promise = new Promise<void>(resolve => {
      release = resolve
    })

    return { promise, release }
  }

  const spinners = (page: Page): Locator =>
    page.getByTestId('spinner-loading-page')

  test('shows the comms error banner instead of the content when the dashboard data fails to load', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await onOperation(page, 'GetDashboardData', route => route.abort())
    await navigateTo('/dashboard')

    await expect(page.getByText(COMMS_ERROR)).toBeVisible()
    await expect(page.getByText("You're all caught up")).toHaveCount(0)
    await expect(page.getByText('Activity', { exact: true })).toHaveCount(0)
    await expect(page.getByText('Editing Queue')).toHaveCount(0)
  })

  test('shows an error only in the activity section when notifications fail to load', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await onOperation(page, 'GetUserNotifications', route => route.abort())
    await navigateTo('/dashboard')

    await expect(page.getByText(COMMS_ERROR)).toHaveCount(1)
    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(page.getByText('Editing Queue')).toBeVisible()
    await expect(page.getByText('Activity', { exact: true })).toBeVisible()
    await expect(page.getByText('No activity yet')).toHaveCount(0)
  })

  test('shows a spinner instead of the content while the dashboard data loads', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const response = deferred()

    await loginAs(testGroup.usernames[0])

    await onOperation(page, 'GetDashboardData', async route => {
      await response.promise
      await route.fallback()
    })

    await navigateTo('/dashboard')

    await expect(spinners(page)).toHaveCount(1)
    await expect(page.getByText("You're all caught up")).toHaveCount(0)
    await expect(page.getByText('Activity', { exact: true })).toHaveCount(0)

    response.release()

    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(spinners(page)).toHaveCount(0)
  })

  test('shows a spinner in the activity section while notifications load, with the rest of the page already rendered', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const response = deferred()

    await loginAs(testGroup.usernames[0])

    await onOperation(page, 'GetUserNotifications', async route => {
      await response.promise
      await route.fallback()
    })

    await navigateTo('/dashboard')

    await expect(page.getByText("You're all caught up")).toBeVisible()
    await expect(page.getByText('Activity', { exact: true })).toBeVisible()
    await expect(spinners(page)).toHaveCount(1)
    await expect(page.getByText('No activity yet')).toHaveCount(0)

    response.release()

    await expect(page.getByText('No activity yet')).toBeVisible()
    await expect(spinners(page)).toHaveCount(0)
  })
})

test.describe('dashboard translations', () => {
  const languageCases = [
    { language: 'es-LA', translations: esLa },
    { language: 'fr', translations: fr },
    { language: 'ru-RU', translations: ru },
  ]

  languageCases.forEach(({ language, translations }) => {
    test(`renders the dashboard in ${language}, with no untranslated keys`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const { dashboardPage } = translations.translation
      const [username, otherUsername] = testGroup.usernames

      await api.createManuscripts({ amount: 1, submitter: username })

      const {
        manuscriptIds: [manuscriptId],
        shortIds: [shortId],
      } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

      await api.createUserNotification({
        manuscriptId,
        username,
        eventType: 'addedAsEditor',
      })

      await loginAs(username)

      await page.route('**/graphql', async route => {
        if (route.request().postDataJSON()?.operationName !== 'CurrentUser') {
          return route.fallback()
        }

        const response = await route.fetch()
        const body = await response.json()
        body.data.currentUser.preferredLanguage = language
        return route.fulfill({ response, json: body })
      })

      await navigateTo('/dashboard')

      await expect(
        page.getByRole('heading', { level: 1, name: dashboardPage.Dashboard }),
      ).toBeVisible()

      const visibleTexts = [
        dashboardPage.actionCards.types.authorSubmit,
        dashboardPage['My Submissions'],
        dashboardPage['To Review'],
        dashboardPage["Manuscripts I'm editor of"],
        dashboardPage.tableCards.author,
        dashboardPage.tableCards.reviewer,
        dashboardPage.tableCards.editor,
        dashboardPage.activity.title,
        dashboardPage.activity.clearAll,
        `${dashboardPage.activity.notifications.addedAsEditor} ${dashboardPage.activity.manuscriptReference.replace('{{shortId}}', String(shortId))}`,
      ]

      for (const text of visibleTexts) {
        // eslint-disable-next-line no-await-in-loop
        await expect(page.getByText(text).first()).toBeVisible()
      }

      await expect(page.locator('body')).not.toContainText('dashboardPage.')
    })
  })
})

test.describe('dashboard redirects and entry points', () => {
  const seedPendingInvitation = (
    page: Page,
    items: Record<string, string>,
  ): Promise<unknown> =>
    page.addInitScript(entries => {
      if (sessionStorage.getItem('pw-invitation-seeded')) return
      sessionStorage.setItem('pw-invitation-seeded', 'true')

      Object.entries(entries).forEach(([key, value]) => {
        localStorage.setItem(key, value)
      })
    }, items)

  test('redirects to the invitation accepted page when an accepted invitation is pending', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const invitationId = randomUUID()

    await loginAs(testGroup.usernames[0])

    await seedPendingInvitation(page, { invitationId })
    await navigateTo('/dashboard')

    await expect(page).toHaveURL(`/${testGroup.groupName}/invitation/accepted`)
  })

  test('redirects to the decline page when a declined invitation is pending', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const invitationId = randomUUID()

    await loginAs(testGroup.usernames[0])

    await seedPendingInvitation(page, {
      invitationId,
      inviteAction: 'decline',
    })

    await navigateTo('/dashboard')

    await expect(page).toHaveURL(
      `/${testGroup.groupName}/decline/${invitationId}`,
    )
  })

  test('submitting a manuscript lands on the dashboard', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: username })

    await loginAs(username)
    await navigateTo(`/versions/${manuscriptId}/submit`)

    await page
      .getByRole('button', { name: 'Submit your research object' })
      .click()
    await page.getByRole('button', { name: 'Submit', exact: true }).click()

    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeVisible()
  })

  test('submitting a review lands on the dashboard', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username, otherUsername] = testGroup.usernames

    const {
      manuscriptIds: [manuscriptId],
    } = await api.createManuscripts({ amount: 1, submitter: otherUsername })

    await api.assignRole({
      username,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.setReviewerStatus({ manuscriptId, username, status: 'accepted' })

    await loginAs(username)
    await navigateTo(`/versions/${manuscriptId}/review`)

    await page.getByTestId('tabs-container').getByText('Review').click()
    await page.locator('[contenteditable="true"]').first().fill('Looks good')
    await page.getByText('Accept', { exact: true }).click()
    await page.getByRole('button', { name: 'Submit', exact: true }).click()
    await page
      .getByRole('button', { name: 'Submit', exact: true })
      .last()
      .click()

    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
    await expect(
      page.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeVisible()
  })
})

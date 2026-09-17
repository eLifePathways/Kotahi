import { test, expect, type Page } from './utils/fixtures'

const openPanel = async (page: Page): Promise<void> => {
  await page.getByTestId('expand-chat').click()
}

const closePanel = async (page: Page): Promise<void> => {
  await page
    .getByTestId('chat-panel')
    .getByRole('button', { name: 'Hide Chat' })
    .click()
}

// isOpen/onToggle are only persisted to localStorage collapseTimeMs after
// the toggle (see eg. ManuscriptsPage.jsx's onAdminChatChange), deferred
// past the panel's own collapse/expand transition - poll rather than
// assume a fixed delay.
const waitForSavedState = async (
  page: Page,
  storageKey: string,
  expected: boolean,
): Promise<void> => {
  await expect
    .poll(() => page.evaluate(key => localStorage.getItem(key), storageKey))
    .toBe(String(expected))
}

// AntD keeps every tab pane a user has visited mounted (not just the active
// one), so scope to the active pane - otherwise eg. the decision page's two
// channels both match a bare `.ProseMirror` / "Send" lookup.
const activeTabPane = (page: Page): ReturnType<Page['locator']> =>
  page.getByTestId('chat-panel').locator('.ant-tabs-tabpane-active')

const sendMessage = async (page: Page, message: string): Promise<void> => {
  const pane = activeTabPane(page)
  await pane.locator('.ProseMirror[contenteditable="true"]').click()
  await page.keyboard.type(message)
  await pane.getByRole('button', { name: 'Send' }).click()
}

type Scenario = {
  name: string
  storageKey: string
  tabs: string[]
}

const runSharedChatPanelTests = (scenario: Scenario): void => {
  const { storageKey, tabs } = scenario

  test('can be opened and closed', async ({ page }) => {
    await expect(page.getByTestId('expand-chat')).toBeVisible()

    await openPanel(page)
    await expect(page.getByTestId('expand-chat')).toBeHidden()

    await closePanel(page)
    await expect(page.getByTestId('expand-chat')).toBeVisible()
  })

  test('shows the right discussion tabs', async ({ page }) => {
    await openPanel(page)

    await Promise.all(
      tabs.map(tabName =>
        expect(
          page.getByTestId('chat-panel').getByRole('tab', { name: tabName }),
        ).toBeVisible(),
      ),
    )
  })

  test('remembers the open/closed state across a reload', async ({ page }) => {
    await expect(page.getByTestId('expand-chat')).toBeVisible()

    await openPanel(page)
    await waitForSavedState(page, storageKey, true)
    await page.reload()
    await expect(page.getByTestId('expand-chat')).toBeHidden()

    await closePanel(page)
    await waitForSavedState(page, storageKey, false)
    await page.reload()
    await expect(page.getByTestId('expand-chat')).toBeVisible()
  })

  test('sending a message shows it in the channel', async ({ page }) => {
    const message = `Playwright test message ${Date.now()}`

    await openPanel(page)

    const [tabToUse] = tabs
    await page
      .getByTestId('chat-panel')
      .getByRole('tab', { name: tabToUse })
      .click()

    await sendMessage(page, message)

    await expect(activeTabPane(page).locator('#messages')).toContainText(
      message,
    )
  })
}

test.describe('group manager discussion panel (admin manuscripts page)', () => {
  test.beforeEach(async ({ loginAs, navigateTo, testGroup }) => {
    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/admin/manuscripts')
  })

  runSharedChatPanelTests({
    name: 'manuscripts',
    storageKey: 'chatPanelExpanded:manuscripts',
    tabs: ['Group Manager discussion'],
  })
})

test.describe('author discussion panel (submit page)', () => {
  test.beforeEach(async ({ api, loginAs, navigateTo, testGroup }) => {
    const submitterUsername = testGroup.usernames[0]

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: submitterUsername,
    })

    await loginAs(submitterUsername)
    await navigateTo(`/versions/${manuscriptIds[0]}/submit`)
  })

  runSharedChatPanelTests({
    name: 'submit',
    storageKey: 'chatPanelExpanded:submit',
    tabs: ['Discussion with editorial team'],
  })
})

test.describe('editorial discussion panel (decision page)', () => {
  test.beforeEach(async ({ api, loginAs, navigateTo, testGroup }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })

    await loginAs(testGroup.groupAdminUsername)
    await navigateTo(`/versions/${manuscriptIds[0]}/decision`)
  })

  runSharedChatPanelTests({
    name: 'decision',
    storageKey: 'chatPanelExpanded:decision',
    tabs: ['Discussion with author', 'Editorial discussion'],
  })
})

test.describe('editorial discussion panel (review page)', () => {
  test.beforeEach(async ({ api, loginAs, navigateTo, testGroup }) => {
    const reviewerUsername = testGroup.usernames[0]

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.createReview({ manuscriptId, username: reviewerUsername })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'completed',
    })

    await loginAs(reviewerUsername)
    await navigateTo(`/versions/${manuscriptId}/review`)
  })

  runSharedChatPanelTests({
    name: 'review',
    storageKey: 'chatPanelExpanded:review',
    tabs: ['Discussion with editorial team'],
  })
})

// Each of these has two independently logged-in users (via openPageAs, so
// two real browser contexts) viewing the *matching* channel from whichever
// page that channel actually shows up on for their role - not two copies of
// the same page - and checks that a message one sends arrives for the other
// without a reload (ie. actually over the messageCreated subscription).
test.describe('live messaging between two users', () => {
  test("two group managers see each other's messages live", async ({
    openPageAs,
    testGroup,
  }) => {
    const [pageA, pageB] = await Promise.all([
      openPageAs(testGroup.groupAdminUsername),
      openPageAs(testGroup.groupManagerUsername),
    ])

    await Promise.all([
      pageA.goto(`/${testGroup.groupName}/admin/manuscripts`),
      pageB.goto(`/${testGroup.groupName}/admin/manuscripts`),
    ])

    await openPanel(pageA)
    await openPanel(pageB)

    const messageFromA = `From group admin ${Date.now()}`
    await sendMessage(pageA, messageFromA)

    await expect(activeTabPane(pageB).locator('#messages')).toContainText(
      messageFromA,
    )

    const messageFromB = `From group manager ${Date.now()}`
    await sendMessage(pageB, messageFromB)

    await expect(activeTabPane(pageA).locator('#messages')).toContainText(
      messageFromB,
    )
  })

  test("an author and an editor see each other's messages live", async ({
    api,
    openPageAs,
    testGroup,
  }) => {
    const authorUsername = testGroup.usernames[0]
    const editorUsername = testGroup.usernames[1]

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: authorUsername,
    })

    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: editorUsername,
      role: 'editor',
      manuscriptIds: [manuscriptId],
    })

    const [authorPage, editorPage] = await Promise.all([
      openPageAs(authorUsername),
      openPageAs(editorUsername),
    ])

    await Promise.all([
      authorPage.goto(
        `/${testGroup.groupName}/versions/${manuscriptId}/submit`,
      ),
      editorPage.goto(
        `/${testGroup.groupName}/versions/${manuscriptId}/decision`,
      ),
    ])

    await openPanel(authorPage)
    await openPanel(editorPage)

    await editorPage
      .getByTestId('chat-panel')
      .getByRole('tab', { name: 'Discussion with author' })
      .click()

    const messageFromAuthor = `From the author ${Date.now()}`
    await sendMessage(authorPage, messageFromAuthor)

    await expect(activeTabPane(editorPage).locator('#messages')).toContainText(
      messageFromAuthor,
    )

    const messageFromEditor = `From the editor ${Date.now()}`
    await sendMessage(editorPage, messageFromEditor)

    await expect(activeTabPane(authorPage).locator('#messages')).toContainText(
      messageFromEditor,
    )
  })

  test("a reviewer and an editor see each other's messages live", async ({
    api,
    openPageAs,
    testGroup,
  }) => {
    const reviewerUsername = testGroup.usernames[0]
    const editorUsername = testGroup.usernames[1]

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.createReview({ manuscriptId, username: reviewerUsername })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'completed',
    })

    await api.assignRole({
      username: editorUsername,
      role: 'editor',
      manuscriptIds: [manuscriptId],
    })

    const [reviewerPage, editorPage] = await Promise.all([
      openPageAs(reviewerUsername),
      openPageAs(editorUsername),
    ])

    await Promise.all([
      reviewerPage.goto(
        `/${testGroup.groupName}/versions/${manuscriptId}/review`,
      ),
      editorPage.goto(
        `/${testGroup.groupName}/versions/${manuscriptId}/decision`,
      ),
    ])

    await openPanel(reviewerPage)
    await openPanel(editorPage)

    await editorPage
      .getByTestId('chat-panel')
      .getByRole('tab', { name: 'Editorial discussion' })
      .click()

    const messageFromReviewer = `From the reviewer ${Date.now()}`
    await sendMessage(reviewerPage, messageFromReviewer)

    await expect(activeTabPane(editorPage).locator('#messages')).toContainText(
      messageFromReviewer,
    )

    const messageFromEditor = `From the editor ${Date.now()}`
    await sendMessage(editorPage, messageFromEditor)

    await expect(
      activeTabPane(reviewerPage).locator('#messages'),
    ).toContainText(messageFromEditor)
  })
})

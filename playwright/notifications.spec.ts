import { test, expect } from './utils/fixtures'

// Ports cypress's b-colab-prc/104-control_page_spec.cy.js context 'sending
// email notifications' ('can send email notifications to existing and
// non-existing users'): the decision page's Tasks & Notifications tab can
// notify a brand new (unregistered) user or an existing one, and each send
// logs a system message into the manuscript's editorial discussion channel
// (see emailUtils.js's sendEmailChannelMessage).
//
// The original cypress test only ever asserted message content for one of
// its four sends (an "Author Invitation" to an existing user) - and even
// that one was almost certainly passing by coincidence: "Author Invitation"
// is an invitation-type template, which additionally requires an active
// Notification (event -> template) row to exist for the group
// (services/notification.service.js's seekEvent) - something the e2e test
// API's createGroup never seeded, so the send would silently no-op with "no
// active event found" rather than actually posting. This port fixes that gap
// (createGroup now mirrors scripts/seedGroups.js's real default-notification
// seeding) so all four sends genuinely succeed, and asserts each one.

test('sending notifications from the Tasks & Notifications tab logs each one to the editorial discussion', async ({
  api,
  loginAs,
  navigateTo,
  page,
  testGroup,
}) => {
  const senderUsername = testGroup.groupAdminUsername
  const [receiverA, receiverB, receiverC] = testGroup.usernames

  const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
  const [manuscriptId] = manuscriptIds

  await loginAs(senderUsername)
  await navigateTo(`/versions/${manuscriptId}/decision?tab=tasks`)

  const row = page.getByTestId('email-notification-row')
  const chatMessages = (): ReturnType<typeof page.locator> =>
    page
      .getByTestId('chat-panel')
      .locator('.ant-tabs-tabpane-active')
      .locator('#messages')

  const selectTemplate = async (name: string): Promise<void> => {
    await row.getByTestId('Notification_email_select').click()
    await row.getByLabel('Notification_email_select').fill(name)
    // Not press('Enter') - "Reviewer Invitation" is a substring of
    // "Collaborative Reviewer Invitation", so both match the filter and
    // Enter can select the wrong one. Click the exact option instead.
    await page
      .getByTestId('select-option')
      .filter({ hasText: new RegExp(`^${name}$`) })
      .click()
  }

  const notify = async (): Promise<void> => {
    await row.getByRole('button', { name: 'Notify' }).click()
  }

  // Open the chat panel once and leave it open - each Notify below should
  // append a new message to the already-visible editorial discussion.
  await page.getByTestId('expand-chat').click()

  await page
    .getByTestId('chat-panel')
    .getByRole('tab', { name: 'Editorial discussion' })
    .click()

  // The dropdown closes after each selection, so it has to be re-opened
  // (re-clicked) before every pick, not just the first.
  const selectReceiver = async (username: string): Promise<void> => {
    await row.getByTestId('choose-receiver').click()
    const input = row.getByLabel('Choose receiver')
    await input.fill(username)
    await input.press('Enter')
  }

  // 1. Brand new (unregistered) user, an invitation-type template.
  await row.getByRole('checkbox', { name: 'New User' }).check()
  await row.locator('[data-cy="new-user-email"]').fill('jon@example.co')
  await row.locator('[data-cy="new-user-name"]').fill('Jon')
  await selectTemplate('Author Invitation')
  await notify()

  await expect(chatMessages()).toContainText(
    `Author Invitation sent by ${senderUsername} to Jon`,
  )

  // 2. Existing user, the same invitation-type template.
  await row.getByRole('checkbox', { name: 'New User' }).uncheck()
  await selectReceiver(receiverA)
  await selectTemplate('Author Invitation')
  await notify()

  await expect(chatMessages()).toContainText(
    `Author Invitation sent by ${senderUsername} to ${receiverA}`,
  )

  // 3. Existing user, a reviewer-invitation template (also assigns them as
  // a reviewer on the manuscript - see EmailNotifications.jsx's
  // onClickActionButton).
  await selectReceiver(receiverB)
  await selectTemplate('Reviewer Invitation')
  await notify()

  await expect(chatMessages()).toContainText(
    `Reviewer Invitation sent by ${senderUsername} to ${receiverB}`,
  )

  // 4. Existing user, a plain (non-invitation) template.
  await selectReceiver(receiverC)
  await selectTemplate('Task notification')
  await notify()

  await expect(chatMessages()).toContainText(
    `Task notification sent by ${senderUsername} to ${receiverC}`,
  )
})

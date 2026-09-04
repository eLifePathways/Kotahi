import { test, expect } from './utils/fixtures'

test('can log in as admin', async ({
  page,
  loginAs,
  navigateTo,
  testGroup,
}) => {
  await loginAs(testGroup.adminUsername)

  await navigateTo('/dashboard')

  await expect(page.getByTestId('menu-user-section')).toContainText(
    testGroup.adminUsername,
  )

  await expect(page.getByTestId('menu-link-dashboard')).toBeVisible()
})

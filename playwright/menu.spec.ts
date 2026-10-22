import { test, expect, type Locator, type Page } from './utils/fixtures'

const menu = (page: Page): Locator =>
  page.getByRole('navigation', { name: 'Main navigation' })

const menuLinkKeys = async (page: Page): Promise<(string | null)[]> =>
  menu(page)
    .locator('[data-testid^="menu-link-"]')
    .evaluateAll(links => links.map(link => link.getAttribute('data-testid')))

const collapseButton = (page: Page): Locator =>
  menu(page)
    .getByTestId('menu-user-section')
    .getByRole('button', { name: 'Collapse menu' })

const expandButton = (page: Page): Locator =>
  menu(page).locator(
    'button[aria-label="Expand menu"]:not([data-testid="menu-user-section"] button)',
  )

test.describe('menu new submission button', () => {
  test('opens the new submission page', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await menu(page).getByRole('button', { name: 'New submission' }).click()

    await expect(page).toHaveURL(`/${testGroup.groupName}/newSubmission`)
  })

  test('is an icon-only button with an aria-label and a tooltip when the menu is collapsed', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await collapseButton(page).click()

    const button = menu(page).getByRole('button', {
      name: 'New submission',
      exact: true,
    })

    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('aria-label', 'New submission')
    await expect(button).not.toContainText('New submission')

    await button.hover()
    await expect(page.getByRole('tooltip')).toHaveText('New submission')

    await button.click()
    await expect(page).toHaveURL(`/${testGroup.groupName}/newSubmission`)
  })
})

const ADMIN_LINKS = [
  'menu-link-dashboard',
  'menu-link-manuscripts',
  'menu-link-reports',
  'menu-link-forms',
  'menu-link-tasks',
  'menu-link-users',
  'menu-link-configuration',
  'menu-link-cms',
]

test.describe('menu group and user sections', () => {
  test('shows the group name and type', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await expect(
      menu(page).getByText(testGroup.groupName, { exact: true }),
    ).toBeVisible()
    await expect(menu(page).getByText('Journal', { exact: true })).toBeVisible()
  })

  test("shows the user's name, linking to their profile", async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const [username] = testGroup.usernames

    await loginAs(username)
    await navigateTo('/dashboard')

    const userLink = menu(page).getByTestId('menu-user')

    await expect(userLink).toContainText(username)
    await expect(userLink).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/profile`,
    )

    await userLink.click()
    await expect(page).toHaveURL(`/${testGroup.groupName}/profile`)
  })
})

test.describe('menu links and role labels', () => {
  const ROLE_LABELS = ['Admin', 'Group Admin', 'Group Manager']

  const roleCases = [
    {
      role: 'a regular user',
      user: 'user',
      links: ['menu-link-dashboard'],
      labels: [],
    },
    {
      role: 'a group manager',
      user: 'groupManager',
      links: ['menu-link-dashboard', 'menu-link-manuscripts'],
      labels: ['Group Manager'],
    },
    {
      role: 'a group admin',
      user: 'groupAdmin',
      links: ADMIN_LINKS,
      labels: ['Group Admin'],
    },
    { role: 'an admin', user: 'admin', links: ADMIN_LINKS, labels: ['Admin'] },
  ]

  roleCases.forEach(({ role, user, links, labels }) => {
    test(`shows the links and role labels for ${role}`, async ({
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      const usernames: Record<string, string> = {
        user: testGroup.usernames[0],
        groupManager: testGroup.groupManagerUsername,
        groupAdmin: testGroup.groupAdminUsername,
        admin: testGroup.adminUsername,
      }

      await loginAs(usernames[user])
      await navigateTo('/dashboard')

      await expect(menu(page).getByTestId('menu-link-dashboard')).toBeVisible()
      expect(await menuLinkKeys(page)).toEqual(links)

      const userSection = menu(page).getByTestId('menu-user-section')

      await Promise.all(
        ROLE_LABELS.map(label =>
          expect(userSection.getByText(label, { exact: true })).toHaveCount(
            labels.includes(label) ? 1 : 0,
          ),
        ),
      )
    })
  })

  test('shows the COAR Notify Inbox link when the COAR Notify tab is enabled', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({
      controlPanel: { showTabs: ['Team', 'Decision', 'COAR Notify Metadata'] },
    })

    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/dashboard')

    await expect(menu(page).getByTestId('menu-link-coar')).toBeVisible()
    expect(await menuLinkKeys(page)).toEqual([
      'menu-link-dashboard',
      'menu-link-manuscripts',
      'menu-link-reports',
      'menu-link-coar',
      'menu-link-forms',
      'menu-link-tasks',
      'menu-link-users',
      'menu-link-configuration',
      'menu-link-cms',
    ])
  })

  test('marks the link for the current page with aria-current', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/dashboard')

    const dashboardLink = menu(page).getByTestId('menu-link-dashboard')
    const manuscriptsLink = menu(page).getByTestId('menu-link-manuscripts')

    await expect(dashboardLink).toHaveAttribute('aria-current', 'page')
    await expect(manuscriptsLink).not.toHaveAttribute('aria-current')

    await manuscriptsLink.click()

    await expect(page).toHaveURL(`/${testGroup.groupName}/admin/manuscripts`)
    await expect(manuscriptsLink).toHaveAttribute('aria-current', 'page')
    await expect(dashboardLink).not.toHaveAttribute('aria-current')
  })
})

test.describe('menu collapse', () => {
  test('collapsing hides the link labels and expanding brings them back', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    const dashboardLink = menu(page).getByTestId('menu-link-dashboard')

    await expect(dashboardLink).toHaveText('Dashboard')

    const collapse = collapseButton(page)

    await expect(collapse).toHaveAttribute('aria-expanded', 'true')
    await collapse.click()

    await expect(dashboardLink).toHaveText('')

    const expand = expandButton(page)

    await expect(expand).toHaveAttribute('aria-expanded', 'false')
    await expand.click()

    await expect(dashboardLink).toHaveText('Dashboard')
    await expect(collapse).toHaveAttribute('aria-expanded', 'true')
  })

  test('the collapsed state is remembered after a reload', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')

    await collapseButton(page).click()
    await expect(expandButton(page)).toBeVisible()

    await page.reload()

    await expect(expandButton(page)).toBeVisible()
    await expect(menu(page).getByTestId('menu-link-dashboard')).toHaveText('')
  })

  test('collapsed links are named by their label and show it in a tooltip', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/dashboard')

    await collapseButton(page).click()
    await expect(menu(page).getByTestId('menu-link-dashboard')).toHaveText('')

    const labels = [
      'Dashboard',
      'Manuscripts',
      'Reports',
      'Forms',
      'Tasks',
      'Users',
      'Configuration',
      'CMS',
    ]

    await Promise.all(
      labels.map(label =>
        expect(
          menu(page).getByRole('link', { name: label, exact: true }),
        ).toBeVisible(),
      ),
    )

    await menu(page)
      .getByRole('link', { name: 'Manuscripts', exact: true })
      .hover()
    await expect(page.getByRole('tooltip')).toHaveText('Manuscripts')
  })
})

test.describe('menu links for disabled pages', () => {
  test('leaves out the Reports link when reports are not shown in the menu', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({ report: { showInMenu: false } })

    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/dashboard')

    await expect(menu(page).getByTestId('menu-link-dashboard')).toBeVisible()
    expect(await menuLinkKeys(page)).toEqual(
      ADMIN_LINKS.filter(key => key !== 'menu-link-reports'),
    )
  })

  test('leaves out the COAR Notify Inbox link when the COAR Notify tab is not enabled', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/dashboard')

    await expect(menu(page).getByTestId('menu-link-dashboard')).toBeVisible()
    await expect(menu(page).getByTestId('menu-link-coar')).toHaveCount(0)
  })

  test('leaves out the Dashboard link for a group type without a dashboard', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({ instanceName: 'preprint1' })

    await loginAs(testGroup.groupAdminUsername)
    await navigateTo('/admin/manuscripts')

    await expect(
      menu(page).getByText('Preprint 1', { exact: true }),
    ).toBeVisible()
    expect(await menuLinkKeys(page)).toEqual(
      ADMIN_LINKS.filter(key => key !== 'menu-link-dashboard'),
    )
  })
})

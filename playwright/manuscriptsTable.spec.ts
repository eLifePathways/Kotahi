import { readFileSync } from 'fs'

import { colorSecondary, colorSuccess, testOrcid } from './utils/constants'
import { test, expect, type Page } from './utils/fixtures'
import { formatAbsoluteDate, formatChipDate, hexToRgb } from './utils/helpers'

// Mirrors VARIANT_CONFIG in packages/client/app/pages/hooks/useManuscriptsTable.tsx
// ('actions' is always appended on top of each variant's defaultColumnKeys)
const DEFAULT_COLUMNS = {
  submitter: [
    'shortId',
    'submission.$title',
    'status',
    'created',
    'updated',
    'actions',
  ],
  reviewer: ['shortId', 'submission.$title', 'reviewerStatusBadge', 'actions'],
  editor: [
    'shortId',
    'submission.$title',
    'status',
    'manuscriptVersions',
    'statusCounts',
    'lastUpdated',
    'actions',
  ],
  admin: [
    'shortId',
    'titleAndAbstract',
    'created',
    'updated',
    'status',
    'submission.$customStatus',
    'author',
    'actions',
  ],
}

const getHeaderTestIds = (page: Page): Promise<(string | undefined)[]> =>
  page
    .locator('.ant-table-thead th[data-testid]')
    .evaluateAll(cells => cells.map(cell => cell.dataset.testid))

test.describe('manuscripts table default columns', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('submissions table shows the default submitter columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/submissions')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.submitter)
  })

  test('reviews table shows the default reviewer columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/reviews')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.reviewer)
  })

  test('edits table shows the default editor columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.editor)
  })

  test('manuscripts table shows the default admin columns', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual(DEFAULT_COLUMNS.admin)
  })
})

// submitter and admin have no forcedColumnKeys in VARIANT_CONFIG
test.describe('manuscripts table forced columns', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('reviewer status column survives a config that omits it', async ({
    page,
    api,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/reviews')
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toContain('reviewerStatusBadge')

    await api.updateGroupConfig({
      dashboard: { tableColumns: 'shortId,submission.$title' },
    })

    await page.reload()
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual([
      'shortId',
      'submission.$title',
      'reviewerStatusBadge',
      'actions',
    ])
  })

  test('statusCounts and lastUpdated columns survive a config that omits them', async ({
    page,
    api,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')
    await expect(page.locator('.ant-table-thead')).toBeVisible()

    const before = await getHeaderTestIds(page)
    expect(before).toContain('statusCounts')
    expect(before).toContain('lastUpdated')

    await api.updateGroupConfig({
      dashboard: { editingQueue: 'shortId,submission.$title,status' },
    })

    await page.reload()
    await expect(page.locator('.ant-table-thead')).toBeVisible()
    expect(await getHeaderTestIds(page)).toEqual([
      'shortId',
      'submission.$title',
      'status',
      'statusCounts',
      'lastUpdated',
      'actions',
    ])
  })
})

test.describe('manuscripts table data', () => {
  test('shows all 15 seeded manuscripts across two pages', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    await api.createManuscripts({ amount: 15, submitter: submitterUsername })

    await loginAs(submitterUsername)

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await navigateTo('/dashboard/submissions')
    await expect(shortIdCells).toHaveCount(10)
    const pageOneIds = await shortIdCells.allTextContents()

    await navigateTo('/dashboard/submissions?pagenum=2')
    await expect(shortIdCells).toHaveCount(5)
    const pageTwoIds = await shortIdCells.allTextContents()

    // shortId is a global sequence, not scoped to this group, so check
    // uniqueness/count rather than specific values.
    const allIds = new Set([...pageOneIds, ...pageTwoIds])
    expect(allIds.size).toBe(15)

    await navigateTo('/dashboard/reviews')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/edits')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('reviewer sees only the manuscripts they were assigned to review', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 5,
      submitter: authorUsername,
    })

    const reviewedManuscriptIds = manuscriptIds.slice(0, 3)

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: reviewedManuscriptIds,
    })

    await loginAs(reviewerUsername)

    await navigateTo('/dashboard/reviews')

    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await navigateTo('/dashboard/submissions')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/edits')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('editor sees manuscripts across all three editor roles they hold', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, editorUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 5,
      submitter: authorUsername,
    })

    const [
      seniorEditorManuscriptId,
      handlingEditorManuscriptId,
      editorManuscriptId,
    ] = manuscriptIds

    await Promise.all(
      [
        ['seniorEditor', seniorEditorManuscriptId],
        ['handlingEditor', handlingEditorManuscriptId],
        ['editor', editorManuscriptId],
      ].map(([role, manuscriptId]) =>
        api.assignRole({
          username: editorUsername,
          role,
          manuscriptIds: [manuscriptId],
        }),
      ),
    )

    await loginAs(editorUsername)

    await navigateTo('/dashboard/edits')
    await expect(
      page.locator('.ant-table-tbody td[data-testid="shortId"]'),
    ).toHaveCount(3)

    await navigateTo('/dashboard/submissions')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/dashboard/reviews')
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('admin, group admin and group manager all see manuscripts from every submitter', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    // No submitter - round-robins across the group's 5 generic users, so
    // these 3 manuscripts get 3 different submitters.
    await api.createManuscripts({ amount: 3 })

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    const usernames = [
      testGroup.adminUsername,
      testGroup.groupAdminUsername,
      testGroup.groupManagerUsername,
    ]

    for (const username of usernames) {
      // eslint-disable-next-line no-await-in-loop
      await loginAs(username)
      // eslint-disable-next-line no-await-in-loop
      await navigateTo('/admin/manuscripts')
      // eslint-disable-next-line no-await-in-loop
      await expect(shortIdCells).toHaveCount(3)
    }
  })
})

test.describe('manuscripts table data types', () => {
  test('single-select options column renders the selected option with its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const singleOptions = [
      { label: 'Alpha', value: 'alpha', labelColor: '#1d4ed8' },
      { label: 'Beta', value: 'beta', labelColor: '#b91c1c' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testSingleOption',
          title: 'Test Single Option',
          component: 'RadioGroup',
          options: singleOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testSingleOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testSingleOption: 'beta' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const singleCell = rows
      .first()
      .locator('td[data-testid="submission.testSingleOption"]')

    await expect(singleCell).toHaveText('Beta')
    await expect(singleCell.locator('span')).toHaveCSS(
      'background-color',
      hexToRgb('#b91c1c'),
    )
  })

  test('options column without a color falls back to the badge default color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const uncoloredOptions = [
      { label: 'Alpha', value: 'alpha' },
      { label: 'Beta', value: 'beta' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testSingleOption',
          title: 'Test Single Option',
          component: 'RadioGroup',
          options: uncoloredOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testSingleOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testSingleOption: 'beta' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const singleCell = rows
      .first()
      .locator('td[data-testid="submission.testSingleOption"]')

    await expect(singleCell).toHaveText('Beta')

    await expect(singleCell.locator('span')).toHaveCSS(
      'background-color',
      hexToRgb(colorSecondary),
    )
  })

  test('multi-select options column renders every selected option with its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const multiOptions = [
      { label: 'Red Team', value: 'red', labelColor: '#dc2626' },
      { label: 'Blue Team', value: 'blue', labelColor: '#2563eb' },
      { label: 'Green Team', value: 'green', labelColor: '#16a34a' },
    ]

    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testMultiOption',
          title: 'Test Multi Option',
          component: 'CheckboxGroup',
          options: multiOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testMultiOption' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testMultiOption: ['red', 'blue'] },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const multiCell = rows
      .first()
      .locator('td[data-testid="submission.testMultiOption"]')

    const multiBadges = multiCell.locator('span')
    await expect(multiBadges).toHaveCount(2)
    await expect(multiCell).toContainText('Red Team')
    await expect(multiCell).toContainText('Blue Team')
    await expect(multiBadges.nth(0)).toHaveCSS(
      'background-color',
      hexToRgb('#dc2626'),
    )
    await expect(multiBadges.nth(1)).toHaveCSS(
      'background-color',
      hexToRgb('#2563eb'),
    )
  })

  test('editable options column renders as a select showing the current option and its color', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const statusOptions = [
      { label: 'Ready', value: 'ready', labelColor: '#059669' },
      { label: 'Blocked', value: 'blocked', labelColor: '#d97706' },
    ]

    // 'submission.$customStatus' is the only column the app will ever render
    // as editable (see useManuscriptsTable.tsx) - reusing it here to
    // exercise that rendering path.
    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.$customStatus',
          title: 'Test Custom Status',
          component: 'Select',
          options: statusOptions,
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: {
        tableColumns: 'shortId,submission.$customStatus',
        labelColumn: true,
      },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $customStatus: 'ready' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const statusSelect = rows
      .first()
      .locator(
        'td[data-testid="submission.$customStatus"] [data-testid="editable-option-select"]',
      )

    await expect(statusSelect).toContainText('Ready')
    await expect(statusSelect.locator('span').first()).toHaveCSS(
      'background-color',
      hexToRgb('#059669'),
    )

    // change the value
    await statusSelect.click()
    await page
      .getByTestId('editable-option')
      .filter({ hasText: 'Blocked' })
      .click()

    await expect(statusSelect).toContainText('Blocked')
    await expect(statusSelect.locator('span').first()).toHaveCSS(
      'background-color',
      hexToRgb('#d97706'),
    )

    // unset the value
    await statusSelect.locator('.ant-select-clear').click()

    await expect(statusSelect).not.toContainText('Blocked')
    await expect(statusSelect).not.toContainText('Ready')
  })

  test('person datatype column shows the submitter without an ORCID', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    // 'author' (admin's default columns already include it) resolves to
    // dataType 'person' unconditionally (see useManuscriptsTable.tsx) - no
    // form field or config change needed to exercise it.
    await api.createManuscripts({ amount: 1, submitter: submitterUsername })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const authorCell = rows.first().locator('td[data-testid="author"]')

    await expect(authorCell.getByTestId('person-name')).toHaveText(
      submitterUsername,
    )

    // This shared pw-* user has no linked ORCID, so that line shouldn't render
    await expect(authorCell).not.toContainText('ORCID')
  })

  test('person datatype column shows the submitter with an ORCID', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.userWithOrcidUsername

    await api.createManuscripts({ amount: 1, submitter: submitterUsername })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const authorCell = rows.first().locator('td[data-testid="author"]')

    await expect(authorCell.getByTestId('person-name')).toHaveText(
      submitterUsername,
    )

    await expect(authorCell).toContainText(`ORCID: ${testOrcid}`)
  })

  test('date column shows "today" for a manuscript created just now', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.createManuscripts({ amount: 1 })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      'today',
    )
  })

  test('date column shows "yesterday" for a manuscript created a day ago', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId,
      created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      'yesterday',
    )
  })

  test('date column shows "N days ago" for a manuscript created a few days ago', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId,
      created: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      '3 days ago',
    )
  })

  test('date column shows the absolute date for a manuscript older than a week', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    const created = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)

    await api.setManuscriptCreated({
      manuscriptId,
      created: created.toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    await expect(rows.first().locator('td[data-testid="created"]')).toHaveText(
      formatAbsoluteDate(created),
    )
  })

  test('reviewer status grid shows a box per reviewer and updates when a status changes', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [editorUsername, reviewerA, reviewerB, reviewerC] =
      testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: editorUsername,
      role: 'editor',
      manuscriptIds: [manuscriptId],
    })

    const reviewers = [reviewerA, reviewerB, reviewerC]

    await Promise.all(
      reviewers.map(username =>
        api.assignRole({
          username,
          role: 'reviewer',
          manuscriptIds: [manuscriptId],
        }),
      ),
    )

    // 'invited' has no color variant of its own (falls back to the badge
    // default) and, with no invitation record on the manuscript, still
    // renders as a normal box - see reviewerStatusEntriesFor's
    // notAlreadyInvited check in useManuscriptsTable.tsx.
    await Promise.all(
      reviewers.map(username =>
        api.setReviewerStatus({ manuscriptId, username, status: 'invited' }),
      ),
    )

    await loginAs(editorUsername)
    await navigateTo('/dashboard/edits')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const statusCell = rows.first().locator('td[data-testid="statusCounts"]')
    const squares = statusCell.getByTestId('reviewer-status-square')
    await expect(squares).toHaveCount(3)

    await expect(squares.nth(0)).toHaveCSS(
      'background-color',
      hexToRgb(colorSecondary),
    )
    await expect(squares.nth(1)).toHaveCSS(
      'background-color',
      hexToRgb(colorSecondary),
    )
    await expect(squares.nth(2)).toHaveCSS(
      'background-color',
      hexToRgb(colorSecondary),
    )

    const reviewerBSquare = statusCell.locator(
      `[data-testid="reviewer-status-square"][aria-label="${reviewerB}: Invited"]`,
    )
    await expect(reviewerBSquare).toBeVisible()

    const headerCell = page.locator('th[data-testid="statusCounts"]')

    const helpButton = headerCell.getByRole('button', {
      name: 'Each block represents a reviewer',
    })

    // open tooltip
    await helpButton.click()

    await expect(page.getByRole('tooltip')).toContainText(
      'Each block represents a reviewer and the color represents their status.',
    )

    // and close tooltip
    await helpButton.click()

    await squares.first().hover()
    const detailedTooltip = page
      .getByRole('tooltip')
      .filter({ hasText: reviewerB })

    await expect(detailedTooltip).toContainText(reviewerB)
    // make compact
    await headerCell.locator('label:has([aria-label="Compact view"])').click()
    await squares.first().hover()
    const compactTooltip = page
      .getByRole('tooltip')
      .filter({ hasText: 'Invited' })
    await expect(compactTooltip).toContainText('Invited')
    // compact view shows numbers, but not names
    await expect(compactTooltip).not.toContainText(reviewerB)

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerB,
      status: 'completed',
    })

    await page.reload()

    const reviewerBSquareAfter = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="statusCounts"]')
      .locator(
        `[data-testid="reviewer-status-square"][aria-label="${reviewerB}: Completed"]`,
      )

    await expect(reviewerBSquareAfter).toBeVisible()
    await expect(reviewerBSquareAfter).toHaveCSS(
      'background-color',
      hexToRgb(colorSuccess),
    )
  })

  test('title column renders as a link when the manuscript has a source URI', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $sourceUri: 'https://example.com/imported-paper' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    const link = titleCell.locator('a')
    await expect(link).toHaveAttribute(
      'href',
      'https://example.com/imported-paper',
    )
    await expect(link).toHaveAttribute('target', '_blank')
    await expect(link).toContainText('Test manuscript 1')
  })

  test('title column renders as plain text when there is no source URI or DOI', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.createManuscripts({ amount: 1 })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    await expect(titleCell.locator('a')).toHaveCount(0)
    await expect(titleCell).toContainText('Test manuscript 1')
  })

  test('title column shows an import source icon for COAR and Semantic Scholar imports', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 2 })
    const [coarManuscriptId, semanticScholarManuscriptId] = manuscriptIds

    await api.patchManuscript({
      manuscriptId: coarManuscriptId,
      patch: { importSourceServer: 'COAR' },
    })

    await api.patchManuscript({
      manuscriptId: semanticScholarManuscriptId,
      patch: { importSourceServer: 'semantic-scholar' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(2)

    const coarRow = rows.filter({ hasText: 'Test manuscript 1' })
    const semanticScholarRow = rows.filter({ hasText: 'Test manuscript 2' })

    await expect(
      coarRow.locator(
        'td[data-testid="titleAndAbstract"] [aria-label="coar notify"]',
      ),
    ).toBeVisible()

    await expect(
      semanticScholarRow.locator(
        'td[data-testid="titleAndAbstract"] [aria-label="semantic scholar"]',
      ),
    ).toBeVisible()
  })

  test('abstract tooltip shows the manuscript abstract', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $abstract: 'This is the manuscript abstract.' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    await titleCell.getByTestId('abstract-tooltip-icon').click()

    const tooltip = page.getByTestId('abstract-tooltip')
    await expect(tooltip).toContainText('Abstract')
    await expect(tooltip).toContainText('This is the manuscript abstract.')
  })

  test('abstract tooltip shows a fallback message when no abstract is set', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    // createManuscripts seeds a default abstract - clear it to exercise the
    // no-abstract fallback.
    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $abstract: null },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    await titleCell.getByTestId('abstract-tooltip-icon').click()

    await expect(page.getByTestId('abstract-tooltip')).toContainText(
      'No abstract provided',
    )
  })

  test('abstract tooltip strips HTML and truncates to 60 words', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const words = Array.from({ length: 70 }, (_, i) => `word${i + 1}`)

    // an inline tag partway through, so stripping isn't just trimming the
    // outer <p> wrapper
    const htmlAbstract = `<p>${words.slice(0, 30).join(' ')} <b>${words[30]}</b> ${words.slice(31).join(' ')}</p>`

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $abstract: htmlAbstract },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')
    await titleCell.getByTestId('abstract-tooltip-icon').click()

    const tooltip = page.getByTestId('abstract-tooltip')

    // stripped: no raw tags leak through as visible text
    await expect(tooltip).not.toContainText('<p>')
    await expect(tooltip).not.toContainText('<b>')

    // truncated to exactly the first 60 words, with a trailing ellipsis
    await expect(tooltip).toContainText(`${words.slice(0, 60).join(' ')}...`)

    const abstractText = await tooltip.evaluate(el =>
      (el.textContent ?? '').replace(/^Abstract/, ''),
    )

    expect(abstractText.trim().split(/\s+/)).toHaveLength(60)
  })

  test('title column strips HTML formatting and shows plain text', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $title: '<p>Some <strong>Bold</strong> Text</p>' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    await expect(titleCell).toContainText('Some Bold Text')
    await expect(titleCell.locator('strong')).toHaveCount(0)
  })

  test('title column truncates a title longer than 60 characters', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds
    const longTitle = 'A'.repeat(75)

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { $title: longTitle },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows.first().locator('td[data-testid="titleAndAbstract"]')

    await expect(titleCell).toContainText(`${'A'.repeat(60)}...`)
  })

  test('submission.$title column renders the title without the abstract tooltip icon', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    // Unlike titleAndAbstract (admin only), submission.$title is the title
    // column used on the submitter/reviewer/editor dashboards and never sets
    // showAbstract - see useManuscriptsTable.tsx.
    const submitterUsername = testGroup.usernames[0]

    await api.createManuscripts({ amount: 1, submitter: submitterUsername })

    await loginAs(submitterUsername)
    await navigateTo('/dashboard/submissions')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const titleCell = rows
      .first()
      .locator('td[data-testid="submission.$title"]')

    await expect(titleCell).toContainText('Test manuscript 1')
    await expect(titleCell.getByTestId('abstract-tooltip-icon')).toHaveCount(0)
  })

  test('a column with no dataType or render function shows the raw value as plain text', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testPlainField',
          title: 'Plain Field',
          component: 'TextField',
          options: [],
        },
      ],
    })

    await api.updateGroupConfig({
      manuscript: { tableColumns: 'shortId,submission.testPlainField' },
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await api.updateManuscriptSubmission({
      manuscriptId,
      patch: { testPlainField: 'Just a plain value' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await expect(rows).toHaveCount(1)

    const cell = rows
      .first()
      .locator('td[data-testid="submission.testPlainField"]')

    await expect(cell).toHaveText('Just a plain value')

    // no dataType-specific wrapper markup (badge, span, avatar, etc.) - just
    // the bare value
    expect(await cell.innerHTML()).toBe('Just a plain value')
  })
})

test.describe('manuscripts table search and filter', () => {
  test('search matches a subset of rows, shows snippets, a chip and the info tooltip, supports the / and Escape shortcuts, and supports quoted phrases, exclusion, OR and wildcards', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    // this test drives ~12 sequential full page navigations - comfortably
    // under the default 30s on a fast machine, but not on slower CI runners
    test.setTimeout(90000)

    const searchTerm = 'platypus'

    // 14 manuscripts are created below, more than the default page size (10)
    await api.updateGroupConfig({ manuscript: { paginationCount: 20 } })

    // A custom submission-form field gets its own search snippet group,
    // keyed by the field's title.
    await api.updateFormFields({
      purpose: 'submit',
      category: 'submission',
      fields: [
        {
          name: 'submission.testKeywords',
          title: 'Keywords',
          component: 'TextField',
          options: [],
        },
      ],
    })

    const { manuscriptIds } = await api.createManuscripts({ amount: 13 })

    const [
      uniqueManuscriptId,
      ,
      ,
      phraseManuscriptId,
      nonAdjacentManuscriptId,
      giraffeOnlyManuscriptId,
      giraffeAndZebraManuscriptId,
      narwhalManuscriptId,
      walrusManuscriptId,
      titleOnlyManuscriptId,
      customFieldManuscriptId,
      articleBodyManuscriptId,
      multiFieldManuscriptId,
    ] = manuscriptIds

    // no other manuscript's submitter is this shared user, so searching for
    // their username isolates this one manuscript
    await api.createManuscripts({
      amount: 1,
      submitter: testGroup.userWithOrcidUsername,
    })

    await api.updateManuscriptSubmission({
      manuscriptId: uniqueManuscriptId,
      patch: {
        $abstract: `This abstract mentions a rare keyword: ${searchTerm}.`,
      },
    })

    // adjacent phrase, for quoted vs unquoted search
    await api.updateManuscriptSubmission({
      manuscriptId: phraseManuscriptId,
      patch: { $abstract: 'This one is about a red panda.' },
    })

    // both words present, but not adjacent
    await api.updateManuscriptSubmission({
      manuscriptId: nonAdjacentManuscriptId,
      patch: { $abstract: 'This one has a red fox and a panda bear.' },
    })

    // for exclusion (-) and wildcard (*) search
    await api.updateManuscriptSubmission({
      manuscriptId: giraffeOnlyManuscriptId,
      patch: { $abstract: 'This one discusses a giraffe.' },
    })

    await api.updateManuscriptSubmission({
      manuscriptId: giraffeAndZebraManuscriptId,
      patch: { $abstract: 'This one has both a giraffe and a zebra.' },
    })

    // for OR search
    await api.updateManuscriptSubmission({
      manuscriptId: narwhalManuscriptId,
      patch: { $abstract: 'This one mentions a narwhal.' },
    })

    await api.updateManuscriptSubmission({
      manuscriptId: walrusManuscriptId,
      patch: { $abstract: 'This one mentions a walrus.' },
    })

    // for a title-field snippet
    await api.updateManuscriptSubmission({
      manuscriptId: titleOnlyManuscriptId,
      patch: { $title: 'A study of the elusive quokka' },
    })

    // for a custom-field snippet
    await api.updateManuscriptSubmission({
      manuscriptId: customFieldManuscriptId,
      patch: { testKeywords: 'This mentions a wombat.' },
    })

    // for an "Article body" snippet - meta isn't part of submission, so this
    // goes through the generic manuscript patch instead
    await api.patchManuscript({
      manuscriptId: articleBodyManuscriptId,
      patch: { meta: { source: 'This article body mentions a hippogriff.' } },
    })

    // same word in both the title and the abstract, for a manuscript with
    // two snippet groups at once
    await api.updateManuscriptSubmission({
      manuscriptId: multiFieldManuscriptId,
      patch: {
        $title: 'Something about the okapi',
        $abstract: 'This abstract also discusses the okapi in detail.',
      },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(14)

    const idOnlyRow = page.locator('.ant-table-tbody tr', {
      hasText: 'Test manuscript 2',
    })

    const idOnlyShortId = await idOnlyRow
      .locator('td[data-testid="shortId"]')
      .textContent()

    const searchInput = page.getByPlaceholder('Enter search terms...')

    // '/' focuses search, Escape un-focuses it
    await expect(searchInput).not.toBeFocused()
    await page.keyboard.press('/')
    await expect(searchInput).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(searchInput).not.toBeFocused()

    const helpButton = page.getByRole('button', {
      name: 'Surround multi-word phrases',
    })

    await helpButton.click()

    const tooltip = page.getByRole('tooltip')
    await expect(tooltip).toContainText('Tips for using search')
    await expect(tooltip).toContainText(
      'Surround multi-word phrases with quotes "".',
    )
    await expect(tooltip).toContainText('Exclude a term by prefixing with -.')
    await expect(tooltip).toContainText('Specify alternate matches using OR.')
    await expect(tooltip).toContainText('Use * as wildcard for word endings.')
    await expect(tooltip).toContainText(
      'Press / anywhere on the page to jump to search.',
    )

    // close the (click-triggered) tooltip before continuing
    await helpButton.click()

    await searchInput.fill(searchTerm)
    await searchInput.press('Enter')

    await expect(shortIdCells).toHaveCount(1)

    const searchChip = page.getByText(`Search: ${searchTerm}`, {
      exact: true,
    })

    await expect(searchChip).toBeVisible()

    const expandedRow = page.locator('.ant-table-expanded-row')
    await expect(expandedRow).toContainText('Abstract:')
    await expect(expandedRow.locator('mark')).toHaveText(searchTerm)

    await searchChip.getByRole('button', { name: 'Remove filter' }).click()
    await expect(shortIdCells).toHaveCount(14)

    // The remaining checks are pure query-syntax scenarios, not new UI
    // interactions - driving them through the URL (a fresh navigation per
    // search) avoids racing overlapping in-flight searches against each
    // other, since the app's search doesn't cancel a stale request when a
    // newer one is fired (network-only fetchPolicy, no de-dupe/abort).
    const searchUrl = (term: string): string =>
      `/admin/manuscripts?search=${encodeURIComponent(term)}`

    // quoted phrase requires adjacency - matches only the manuscript with
    // "red panda" together, not the one with both words apart
    await navigateTo(searchUrl('"red panda"'))
    await expect(shortIdCells).toHaveCount(1)

    // unquoted is just an AND of the two words, regardless of adjacency
    await navigateTo(searchUrl('red panda'))
    await expect(shortIdCells).toHaveCount(2)

    // exclude with - : matches "giraffe" but not the one that also has "zebra"
    await navigateTo(searchUrl('giraffe -zebra'))
    await expect(shortIdCells).toHaveCount(1)

    // OR: matches either term
    await navigateTo(searchUrl('narwhal OR walrus'))
    await expect(shortIdCells).toHaveCount(2)

    // wildcard: "gira*" matches both manuscripts containing "giraffe"
    await navigateTo(searchUrl('gira*'))
    await expect(shortIdCells).toHaveCount(2)

    // title field snippet
    await navigateTo(searchUrl('quokka'))
    await expect(shortIdCells).toHaveCount(1)
    await expect(page.locator('.ant-table-expanded-row')).toContainText(
      'Title:',
    )
    await expect(
      page.locator('.ant-table-expanded-row').locator('mark'),
    ).toHaveText('quokka')

    // custom submission-form field snippet, labeled by its title
    await navigateTo(searchUrl('wombat'))
    await expect(shortIdCells).toHaveCount(1)
    await expect(page.locator('.ant-table-expanded-row')).toContainText(
      'Keywords:',
    )
    await expect(
      page.locator('.ant-table-expanded-row').locator('mark'),
    ).toHaveText('wombat')

    // "Manuscript ID" snippet - matches on the manuscript's own shortId
    await navigateTo(searchUrl(idOnlyShortId as string))
    await expect(shortIdCells).toHaveCount(1)
    await expect(page.locator('.ant-table-expanded-row')).toContainText(
      'Manuscript ID:',
    )

    // "Article body" snippet - meta.source, not a submission field
    await navigateTo(searchUrl('hippogriff'))
    await expect(shortIdCells).toHaveCount(1)
    await expect(page.locator('.ant-table-expanded-row')).toContainText(
      'Article body:',
    )
    await expect(
      page.locator('.ant-table-expanded-row').locator('mark'),
    ).toHaveText('hippogriff')

    // one manuscript matching in two fields at once shows both snippet groups
    await navigateTo(searchUrl('okapi'))
    await expect(shortIdCells).toHaveCount(1)

    const multiFieldSnippets = page.locator('.ant-table-expanded-row')
    await expect(multiFieldSnippets).toContainText('Title:')
    await expect(multiFieldSnippets).toContainText('Abstract:')
    await expect(multiFieldSnippets.locator('mark')).toHaveCount(2)

    // an author's name matches (it's indexed for search) but gets no
    // snippet of its own - there's no snippet field group for it
    await navigateTo(searchUrl(testGroup.userWithOrcidUsername))
    await expect(shortIdCells).toHaveCount(1)
    await expect(page.locator('.ant-table-expanded-row')).toHaveCount(0)

    // a term matching nothing shows the empty state, with no stray rows or
    // expanded snippets, but the search chip still reflects the query
    await navigateTo(searchUrl('unicorn'))

    await expect(shortIdCells).toHaveCount(0)
    await expect(page.locator('.ant-table-expanded-row')).toHaveCount(0)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toHaveText('No matching manuscripts were found')
    await expect(
      page.getByText('Search: unicorn', { exact: true }),
    ).toBeVisible()
  })

  test('status dropdown filter narrows results and shows a filter chip', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 3 })
    const [submittedManuscriptId] = manuscriptIds

    await api.patchManuscript({
      manuscriptId: submittedManuscriptId,
      patch: { status: 'submitted' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(3)

    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const filterDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await filterDropdown.getByText('Submitted', { exact: true }).click()
    await filterDropdown.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(1)

    const statusChip = page.getByText('Status: Submitted', { exact: true })
    await expect(statusChip).toBeVisible()

    // filter state is URL-driven, so it should survive a reload
    await page.reload()
    await expect(shortIdCells).toHaveCount(1)
    await expect(statusChip).toBeVisible()

    await statusChip.getByRole('button', { name: 'Remove filter' }).click()

    await expect(shortIdCells).toHaveCount(3)
    await expect(statusChip).toHaveCount(0)

    // re-apply, then use Reset instead of the chip to clear it - Reset only
    // clears the dropdown's pending selection, OK is what actually applies it
    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const reopenedDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await reopenedDropdown.getByText('Submitted', { exact: true }).click()
    await reopenedDropdown.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(1)
    await expect(statusChip).toBeVisible()

    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const resetDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await resetDropdown.getByRole('button', { name: 'Reset' }).click()
    await resetDropdown.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(3)
    await expect(statusChip).toHaveCount(0)
  })

  test('status filter with multiple values selected shows a chip per value and matches the union', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 3 })
    const [submittedManuscriptId, acceptedManuscriptId] = manuscriptIds

    await api.patchManuscript({
      manuscriptId: submittedManuscriptId,
      patch: { status: 'submitted' },
    })

    await api.patchManuscript({
      manuscriptId: acceptedManuscriptId,
      patch: { status: 'accepted' },
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(3)

    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const filterDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await filterDropdown.getByText('Submitted', { exact: true }).click()
    await filterDropdown.getByText('Accepted', { exact: true }).click()
    await filterDropdown.getByRole('button', { name: 'OK' }).click()

    // Union of the two selected values - excludes the third (default 'new')
    // manuscript.
    await expect(shortIdCells).toHaveCount(2)

    await expect(
      page.getByText('Status: Submitted', { exact: true }),
    ).toBeVisible()
    await expect(
      page.getByText('Status: Accepted', { exact: true }),
    ).toBeVisible()
  })

  test('date range filter narrows results and shows a filter chip', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 3 })
    const [oldManuscriptId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId: oldManuscriptId,
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(3)

    await page
      .locator('th[data-testid="created"]')
      .getByRole('button', { name: 'filter' })
      .click()

    // opens the RangePicker's own calendar/presets popup
    await page.getByPlaceholder('Start date').click()
    await page.locator('.ant-picker-dropdown').getByText('Today').click()

    await expect(shortIdCells).toHaveCount(2)

    const today = formatChipDate(new Date())
    const dateChip = page.getByText(`Created: ${today} – ${today}`, {
      exact: true,
    })

    await expect(dateChip).toBeVisible()

    await dateChip.getByRole('button', { name: 'Remove filter' }).click()

    await expect(shortIdCells).toHaveCount(3)
    await expect(dateChip).toHaveCount(0)

    // manually picking the same range (today - today) from the calendar,
    // instead of using the preset, should narrow results the same way
    await page
      .locator('th[data-testid="created"]')
      .getByRole('button', { name: 'filter' })
      .click()

    await page.getByPlaceholder('Start date').click()

    const todayCell = page.locator(
      '.ant-picker-dropdown .ant-picker-cell-today',
    )
    await todayCell.click()
    await todayCell.click()

    await expect(shortIdCells).toHaveCount(2)
    await expect(dateChip).toBeVisible()

    // clearing via the RangePicker's own "x" (rather than the chip) should
    // also remove the filter - the picker closes once a range is complete,
    // so the filter dropdown needs reopening to reach the clear button.
    await page
      .locator('th[data-testid="created"]')
      .getByRole('button', { name: 'filter' })
      .click()

    await page.locator('.ant-picker-clear').click()

    await expect(shortIdCells).toHaveCount(3)
    await expect(dateChip).toHaveCount(0)
  })

  test('applying multiple filters and a search narrows results, and removing them one by one restores rows', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const searchTerm = 'walrus'

    const { manuscriptIds } = await api.createManuscripts({ amount: 5 })
    const [
      _,
      submittedTodayId,
      submittedOldId,
      submittedTodayWithTermId,
      newTodayWithTermId,
    ] = manuscriptIds

    await Promise.all(
      [submittedTodayId, submittedOldId, submittedTodayWithTermId].map(
        manuscriptId =>
          api.patchManuscript({ manuscriptId, patch: { status: 'submitted' } }),
      ),
    )

    await api.setManuscriptCreated({
      manuscriptId: submittedOldId,
      created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await Promise.all(
      [submittedTodayWithTermId, newTodayWithTermId].map(manuscriptId =>
        api.updateManuscriptSubmission({
          manuscriptId,
          patch: { $abstract: `This one mentions a ${searchTerm}.` },
        }),
      ),
    )

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(5)

    // filter 1: status = Submitted - excludes the 2 'new' manuscripts
    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const statusDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await statusDropdown.getByText('Submitted', { exact: true }).click()
    await statusDropdown.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(3)

    // filter 2: created = Today - additionally excludes the backdated one
    await page
      .locator('th[data-testid="created"]')
      .getByRole('button', { name: 'filter' })
      .click()

    await page.getByPlaceholder('Start date').click()
    await page.locator('.ant-picker-dropdown').getByText('Today').click()

    await expect(shortIdCells).toHaveCount(2)

    // search - additionally excludes the submitted-but-no-keyword one
    const searchInput = page.getByPlaceholder('Enter search terms...')
    await searchInput.fill(searchTerm)
    await searchInput.press('Enter')

    await expect(shortIdCells).toHaveCount(1)

    const today = formatChipDate(new Date())
    const searchChip = page.getByText(`Search: ${searchTerm}`, {
      exact: true,
    })
    const statusChip = page.getByText('Status: Submitted', { exact: true })
    const dateChip = page.getByText(`Created: ${today} – ${today}`, {
      exact: true,
    })

    await expect(searchChip).toBeVisible()
    await expect(statusChip).toBeVisible()
    await expect(dateChip).toBeVisible()

    // remove one by one, in a different order than they were applied
    await searchChip.getByRole('button', { name: 'Remove filter' }).click()
    await expect(shortIdCells).toHaveCount(2)
    await expect(searchChip).toHaveCount(0)
    await expect(statusChip).toBeVisible()
    await expect(dateChip).toBeVisible()

    await dateChip.getByRole('button', { name: 'Remove filter' }).click()
    await expect(shortIdCells).toHaveCount(3)
    await expect(dateChip).toHaveCount(0)
    await expect(statusChip).toBeVisible()

    await statusChip.getByRole('button', { name: 'Remove filter' }).click()
    await expect(shortIdCells).toHaveCount(5)
    await expect(statusChip).toHaveCount(0)
  })

  test('applying a filter while on a page other than the first resets pagination to page 1', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    // paginationCount is 10 - 15 manuscripts makes an unfiltered second page,
    // and patching 12 of them makes a filtered set that still spans two
    // pages, so a failure to reset would show page 2 of the filtered set
    // (2 rows) rather than page 1 of it (10 rows).
    const { manuscriptIds } = await api.createManuscripts({ amount: 15 })

    await Promise.all(
      manuscriptIds
        .slice(0, 12)
        .map(manuscriptId =>
          api.patchManuscript({ manuscriptId, patch: { status: 'submitted' } }),
        ),
    )

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts?pagenum=2')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(5)
    expect(page.url()).toContain('pagenum=2')

    await page
      .locator('th[data-testid="status"]')
      .getByRole('button', { name: 'filter' })
      .click()

    const filterDropdown = page.locator('.ant-table-filter-dropdown:visible')
    await filterDropdown.getByText('Submitted', { exact: true }).click()
    await filterDropdown.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(10)
    expect(page.url()).toContain('pagenum=1')
    expect(page.url()).not.toContain('pagenum=2')
  })
})

test.describe('manuscripts table column sortable and filterable', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('shortId column is sortable but not filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="shortId"]')
    await expect(header).toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })

  test('title column is sortable but not filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="titleAndAbstract"]')
    await expect(header).toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })

  test('date columns are both sortable and filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="created"]')
    await expect(header).toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toBeVisible()
  })

  test('options-based columns (status) are filterable but not sortable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="status"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toBeVisible()
  })

  test('person column (author) is neither sortable nor filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="author"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })

  test('reviewer status badge column is filterable but not sortable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/reviews')

    const header = page.locator('th[data-testid="reviewerStatusBadge"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toBeVisible()
  })

  test('reviewer status summary column (statusCounts) is neither sortable nor filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')

    const header = page.locator('th[data-testid="statusCounts"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })

  test('manuscriptVersions column is explicitly not sortable, and not filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')

    const header = page.locator('th[data-testid="manuscriptVersions"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })

  test('lastUpdated column is neither sortable nor filterable', async ({
    page,
    navigateTo,
  }) => {
    await navigateTo('/dashboard/edits')

    const header = page.locator('th[data-testid="lastUpdated"]')
    await expect(header).not.toHaveAttribute('aria-description', 'sortable')
    await expect(header.getByRole('button', { name: 'filter' })).toHaveCount(0)
  })
})

test.describe('manuscripts table sorting', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('clicking the shortId column header sorts ascending, then descending', async ({
    api,
    page,
    navigateTo,
  }) => {
    await api.createManuscripts({ amount: 3 })
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(3)
    const initial = (await shortIdCells.allTextContents()).map(Number)

    const header = page.locator('th[data-testid="shortId"]')

    // Clicking re-fetches over the network, so poll until the order has
    // actually changed from the previous state before reading it, rather
    // than assuming a fixed delay.
    await header.click()

    await expect
      .poll(async () => (await shortIdCells.allTextContents()).join(','))
      .not.toBe(initial.join(','))

    const afterFirstClick = (await shortIdCells.allTextContents()).map(Number)
    await expect(header).toHaveAttribute('aria-sort', 'ascending')
    expect(afterFirstClick).toEqual([...afterFirstClick].sort((a, b) => a - b))

    await header.click()

    await expect
      .poll(async () => (await shortIdCells.allTextContents()).join(','))
      .not.toBe(afterFirstClick.join(','))

    const afterSecondClick = (await shortIdCells.allTextContents()).map(Number)

    await expect(header).toHaveAttribute('aria-sort', 'descending')
    expect(afterSecondClick).toEqual(
      [...afterSecondClick].sort((a, b) => b - a),
    )

    // the two directions should be exact reverses of each other
    expect(afterSecondClick).toEqual([...afterFirstClick].reverse())
  })

  test('sorting by shortId via the URL produces exactly reversed order', async ({
    api,
    page,
    navigateTo,
  }) => {
    await api.createManuscripts({ amount: 4 })

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await navigateTo('/admin/manuscripts?sort=shortId_ascend')
    const ascending = (await shortIdCells.allTextContents()).map(Number)
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b))

    await navigateTo('/admin/manuscripts?sort=shortId_descend')
    const descending = (await shortIdCells.allTextContents()).map(Number)
    expect(descending).toEqual([...ascending].reverse())
  })

  test('sorting by created date reorders rows chronologically', async ({
    api,
    page,
    navigateTo,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 3 })
    const [oldestId, middleId, newestId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId: oldestId,
      created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await api.setManuscriptCreated({
      manuscriptId: middleId,
      created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await api.setManuscriptCreated({
      manuscriptId: newestId,
      created: new Date().toISOString(),
    })

    const rows = page.locator('.ant-table-tbody tr')

    await navigateTo('/admin/manuscripts?sort=created_ascend')
    await expect(rows).toHaveCount(3)

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    const ascendingByCreated = await shortIdCells.allTextContents()

    await navigateTo('/admin/manuscripts?sort=created_descend')
    await expect(shortIdCells).toHaveText([...ascendingByCreated].reverse())
  })

  test('with no sort applied, rows default to created date descending (newest first)', async ({
    api,
    page,
    navigateTo,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 3 })
    const [oldestId, middleId, newestId] = manuscriptIds

    await api.setManuscriptCreated({
      manuscriptId: oldestId,
      created: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await api.setManuscriptCreated({
      manuscriptId: middleId,
      created: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    })

    await api.setManuscriptCreated({
      manuscriptId: newestId,
      created: new Date().toISOString(),
    })

    // no ?sort= param at all - relying entirely on the table's own default
    await navigateTo('/admin/manuscripts')

    const header = page.locator('th[data-testid="created"]')
    await expect(header).toHaveAttribute('aria-sort', 'descending')

    const shortIdOf = async (title: string): Promise<string> => {
      const text = await page
        .locator('.ant-table-tbody tr', { hasText: title })
        .locator('td[data-testid="shortId"]')
        .textContent()

      return text as string
    }

    const [oldestShortId, middleShortId, newestShortId] = await Promise.all([
      shortIdOf('Test manuscript 1'),
      shortIdOf('Test manuscript 2'),
      shortIdOf('Test manuscript 3'),
    ])

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveText([
      newestShortId,
      middleShortId,
      oldestShortId,
    ])
  })
})

test.describe('manuscripts table actions column', () => {
  test('submitter dashboard shows a status-specific submission link, and a production link only when author proofing applies', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const submitterUsername = testGroup.usernames[0]

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: submitterUsername,
    })

    const [manuscriptId] = manuscriptIds

    await loginAs(submitterUsername)
    await navigateTo('/dashboard/submissions')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    const submissionLink = actionsCell.getByTestId('submission-action-link')
    await expect(submissionLink).toHaveText('Continue Submission')
    await expect(submissionLink).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/versions/${manuscriptId}/submit`,
    )

    await expect(actionsCell.getByTestId('production-action-link')).toHaveCount(
      0,
    )

    // author proofing only applies once enabled, the manuscript has an
    // assigned author, and its status is one of assigned/inProgress/completed
    await api.updateGroupConfig({
      controlPanel: { authorProofingEnabled: true },
    })

    await api.patchManuscript({
      manuscriptId,
      patch: {
        status: 'completed',
        authorFeedback: {
          // AssignedAuthor's fields are all non-null in the GraphQL schema -
          // an incomplete entry here nulls out the whole manuscripts list.
          assignedAuthors: [
            {
              authorId: 'test-author-id',
              authorName: submitterUsername,
              assignedOnDate: new Date().toISOString(),
            },
          ],
        },
      },
    })

    await page.reload()

    await expect(submissionLink).toHaveText('View')

    const productionLink = actionsCell.getByTestId('production-action-link')
    await expect(productionLink).toHaveText('View production feedback')
    await expect(productionLink).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/versions/${manuscriptId}/production`,
    )

    // assigned/inProgress show a different production link label
    await api.patchManuscript({ manuscriptId, patch: { status: 'assigned' } })
    await page.reload()
    await expect(productionLink).toHaveText('Provide production feedback')

    await api.patchManuscript({ manuscriptId, patch: { status: 'inProgress' } })
    await page.reload()
    await expect(productionLink).toHaveText('Provide production feedback')

    // revise/revising have their own submission-link text, and aren't
    // eligible for author proofing (no production link)
    await api.patchManuscript({ manuscriptId, patch: { status: 'revise' } })
    await page.reload()
    await expect(submissionLink).toHaveText('Revise')
    await expect(actionsCell.getByTestId('production-action-link')).toHaveCount(
      0,
    )

    await api.patchManuscript({ manuscriptId, patch: { status: 'revising' } })
    await page.reload()
    await expect(submissionLink).toHaveText('Continue Revision')
  })

  test('editor dashboard always shows Control and Production links', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, editorUsername] = testGroup.usernames

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

    await loginAs(editorUsername)
    await navigateTo('/dashboard/edits')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    const controlLink = actionsCell.getByTestId('control-link')
    await expect(controlLink).toHaveText('Control')
    await expect(controlLink).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/versions/${manuscriptId}/decision`,
    )

    const productionLink = actionsCell.getByTestId('production-link')
    await expect(productionLink).toHaveText('Production')
    await expect(productionLink).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/versions/${manuscriptId}/production`,
    )
  })

  test("reviewer dashboard's actions vary by the reviewer's own status", async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 5,
      submitter: authorUsername,
    })

    const [invitedId, acceptedId, inProgressId, completedId, rejectedId] =
      manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds,
    })

    await Promise.all([
      api.setReviewerStatus({
        manuscriptId: invitedId,
        username: reviewerUsername,
        status: 'invited',
      }),
      api.setReviewerStatus({
        manuscriptId: acceptedId,
        username: reviewerUsername,
        status: 'accepted',
      }),
      api.setReviewerStatus({
        manuscriptId: inProgressId,
        username: reviewerUsername,
        status: 'inProgress',
      }),
      api.setReviewerStatus({
        manuscriptId: completedId,
        username: reviewerUsername,
        status: 'completed',
      }),
      api.setReviewerStatus({
        manuscriptId: rejectedId,
        username: reviewerUsername,
        status: 'rejected',
      }),
    ])

    await loginAs(reviewerUsername)
    await navigateTo('/dashboard/reviews')

    const actionsCellFor = (title: string): ReturnType<Page['locator']> =>
      page
        .locator('.ant-table-tbody tr', { hasText: title })
        .locator('td[data-testid="actions"]')

    // invited: accept/reject buttons, not links to a page
    const invitedActions = actionsCellFor('Test manuscript 1')
    await expect(invitedActions.getByTestId('accept-review')).toHaveText(
      'Accept',
    )
    await expect(invitedActions.getByTestId('reject-review')).toHaveText(
      'Decline',
    )

    await expect(
      actionsCellFor('Test manuscript 2').getByTestId('review-action-link'),
    ).toHaveText('Do Review')

    await expect(
      actionsCellFor('Test manuscript 3').getByTestId('review-action-link'),
    ).toHaveText('Continue Review')

    await expect(
      actionsCellFor('Test manuscript 4').getByTestId('review-action-link'),
    ).toHaveText('View')

    // rejected: no actions at all
    await expect(actionsCellFor('Test manuscript 5').locator('a')).toHaveCount(
      0,
    )
  })

  test('admin dashboard hides Control and Production links for archived manuscripts', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await expect(actionsCell.getByTestId('view-action-link')).toBeVisible()
    await expect(actionsCell.getByTestId('control-action-link')).toBeVisible()
    await expect(
      actionsCell.getByTestId('production-action-link'),
    ).toBeVisible()

    await api.patchManuscript({ manuscriptId, patch: { isHidden: true } })
    await navigateTo('/admin/manuscripts?archived=true')

    const archivedActionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await expect(
      archivedActionsCell.getByTestId('view-action-link'),
    ).toBeVisible()
    await expect(
      archivedActionsCell.getByTestId('control-action-link'),
    ).toHaveCount(0)
    await expect(
      archivedActionsCell.getByTestId('production-action-link'),
    ).toHaveCount(0)
  })

  test('admin dashboard shows Evaluation and Publish links only for preprint-instance manuscripts', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.updateGroupConfig({ instanceName: 'preprint1' })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    // default status 'new' is one of the articleStatuses values, so
    // Evaluation shows; Control never shows outside journal/prc instances
    await expect(
      actionsCell.getByTestId('evaluation-action-link'),
    ).toHaveAttribute(
      'href',
      `/${testGroup.groupName}/versions/${manuscriptId}/evaluation`,
    )
    await expect(actionsCell.getByTestId('control-action-link')).toHaveCount(0)
    await expect(actionsCell.getByTestId('publish-action-link')).toHaveCount(0)

    // Publish only appears once the manuscript has been evaluated
    await api.patchManuscript({ manuscriptId, patch: { status: 'evaluated' } })
    await page.reload()

    await expect(actionsCell.getByTestId('publish-action-link')).toHaveText(
      'Publish',
    )
  })

  test("admin dashboard's Publish link opens a confirmation dialog without publishing on cancel", async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    await api.updateGroupConfig({ instanceName: 'preprint1' })

    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds
    await api.patchManuscript({ manuscriptId, patch: { status: 'evaluated' } })

    await loginAs(testGroup.adminUsername)
    await navigateTo('/admin/manuscripts')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await actionsCell.getByTestId('publish-action-link').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Publish this manuscript?')

    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toHaveCount(0)

    // still shows the Publish link, unpublished
    await expect(actionsCell.getByTestId('publish-action-link')).toHaveText(
      'Publish',
    )

    // Actually publishing is dependent on external systems (flax, crossref etc.)
    // so there's no clean way to test this without bringing up mock servers
    // alongside the app.
  })

  test("reviewer's Accept button actually accepts the review invitation", async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: authorUsername,
    })

    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'invited',
    })

    await loginAs(reviewerUsername)
    await navigateTo('/dashboard/reviews')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await actionsCell.getByTestId('accept-review').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Accept this review invitation?')
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(dialog).toHaveCount(0)

    // the row doesn't reactively update from this mutation - reload to see it
    await navigateTo('/dashboard/reviews')

    await expect(actionsCell.getByTestId('review-action-link')).toHaveText(
      'Do Review',
    )
  })

  test("reviewer's Decline button actually declines the review invitation", async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: authorUsername,
    })

    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'invited',
    })

    await loginAs(reviewerUsername)
    await navigateTo('/dashboard/reviews')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await actionsCell.getByTestId('reject-review').click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Decline this review invitation?')
    await dialog.getByRole('button', { name: 'OK' }).click()
    await expect(dialog).toHaveCount(0)

    // the row doesn't reactively update from this mutation - reload to see it
    await navigateTo('/dashboard/reviews')

    // rejected: no actions rendered at all
    await expect(actionsCell.locator('a')).toHaveCount(0)
    await expect(actionsCell.getByTestId('accept-review')).toHaveCount(0)
    await expect(actionsCell.getByTestId('reject-review')).toHaveCount(0)
  })

  test('clicking Do Review as an accepted reviewer moves their status to inProgress and navigates to the review page', async ({
    api,
    loginAs,
    page,
    navigateTo,
    testGroup,
  }) => {
    const [authorUsername, reviewerUsername] = testGroup.usernames

    const { manuscriptIds } = await api.createManuscripts({
      amount: 1,
      submitter: authorUsername,
    })

    const [manuscriptId] = manuscriptIds

    await api.assignRole({
      username: reviewerUsername,
      role: 'reviewer',
      manuscriptIds: [manuscriptId],
    })

    await api.setReviewerStatus({
      manuscriptId,
      username: reviewerUsername,
      status: 'accepted',
    })

    await loginAs(reviewerUsername)
    await navigateTo('/dashboard/reviews')

    const actionsCell = page
      .locator('.ant-table-tbody tr')
      .first()
      .locator('td[data-testid="actions"]')

    await actionsCell.getByTestId('review-action-link').click()

    await expect(page).toHaveURL(new RegExp(`/versions/${manuscriptId}/review`))

    await navigateTo('/dashboard/reviews')

    await expect(actionsCell.getByTestId('review-action-link')).toHaveText(
      'Continue Review',
    )
  })
})

test.describe('manuscripts table scrolling', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('shows a horizontal scrollbar when the table is wider than the viewport', async ({
    page,
    navigateTo,
  }) => {
    await page.setViewportSize({ width: 400, height: 720 })
    await navigateTo('/admin/manuscripts')

    const wrapper = page.locator('.ant-table-wrapper')
    await expect(wrapper).toBeVisible()

    const dimensions = await wrapper.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      /* eslint-disable-next-line no-undef */
      overflowX: window.getComputedStyle(el).overflowX,
    }))

    expect(dimensions.overflowX).toBe('auto')
    expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth)

    // functional check: scrolling the wrapper actually reveals content that
    // was off to the right, e.g. the actions column
    const actionsHeader = page.locator('th[data-testid="actions"]')
    const before = await actionsHeader.boundingBox()

    await wrapper.evaluate(el => {
      el.scrollLeft = el.scrollWidth
    })

    const after = await actionsHeader.boundingBox()
    expect(after!.x).toBeLessThan(before!.x)
  })

  test('does not show a horizontal scrollbar when the viewport is wide enough', async ({
    page,
    navigateTo,
  }) => {
    await page.setViewportSize({ width: 2000, height: 720 })
    await navigateTo('/admin/manuscripts')

    const wrapper = page.locator('.ant-table-wrapper')
    await expect(wrapper).toBeVisible()

    const dimensions = await wrapper.evaluate(el => ({
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
    }))

    expect(dimensions.scrollWidth).toBe(dimensions.clientWidth)
  })
})

test.describe('manuscripts table archiving', () => {
  test.beforeEach(async ({ loginAs, testGroup }) => {
    await loginAs(testGroup.adminUsername)
  })

  test('selecting a manuscript and clicking Archive removes it from the default view', async ({
    api,
    page,
    navigateTo,
  }) => {
    await api.createManuscripts({ amount: 2 })
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(2)

    const rows = page.locator('.ant-table-tbody tr')
    await rows.first().getByRole('checkbox').check()

    await expect(page.getByTestId('selected-manuscripts-number')).toHaveText(
      '1 selected',
    )

    const archiveButton = page.getByRole('button', {
      name: 'Archive',
      exact: true,
    })

    const unarchiveButton = page.getByRole('button', {
      name: 'Restore from archive',
    })

    await expect(archiveButton).toBeEnabled()
    await expect(unarchiveButton).toBeDisabled()

    await archiveButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Archive 1 manuscripts?')
    await dialog.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(1)
  })

  test('selecting all manuscripts via the header checkbox and clicking Archive archives all of them', async ({
    api,
    page,
    navigateTo,
  }) => {
    await api.createManuscripts({ amount: 3 })
    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(3)

    await page.locator('thead').getByRole('checkbox').check()

    const selectedCount = page.getByTestId('selected-manuscripts-number')
    await expect(selectedCount).toHaveText('3 selected')

    const archiveButton = page.getByRole('button', {
      name: 'Archive',
      exact: true,
    })

    const dialog = page.getByRole('dialog')

    // cancelling leaves the selection and the manuscripts untouched
    await archiveButton.click()
    await expect(dialog).toContainText('Archive 3 manuscripts?')
    await dialog.getByRole('button', { name: 'Cancel' }).click()
    await expect(dialog).toHaveCount(0)

    await expect(shortIdCells).toHaveCount(3)
    await expect(selectedCount).toHaveText('3 selected')

    // confirming actually archives them
    await archiveButton.click()
    await expect(dialog).toContainText('Archive 3 manuscripts?')
    await dialog.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(0)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()
  })

  test('selecting an archived manuscript and clicking Restore from archive returns it to the default view', async ({
    api,
    page,
    navigateTo,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 1 })
    const [manuscriptId] = manuscriptIds
    await api.patchManuscript({ manuscriptId, patch: { isHidden: true } })

    await navigateTo('/admin/manuscripts?archived=true')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(1)

    const rows = page.locator('.ant-table-tbody tr')
    await rows.first().getByRole('checkbox').check()

    const archiveButton = page.getByRole('button', {
      name: 'Archive',
      exact: true,
    })

    const unarchiveButton = page.getByRole('button', {
      name: 'Restore from archive',
    })

    // viewing the archived list, everything selected is already archived
    await expect(archiveButton).toBeDisabled()
    await expect(unarchiveButton).toBeEnabled()

    await unarchiveButton.click()

    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Unarchive 1 manuscripts?')
    await dialog.getByRole('button', { name: 'OK' }).click()

    await expect(shortIdCells).toHaveCount(0)
    await expect(
      page.getByTestId('empty-manuscripts-table-placeholder'),
    ).toBeVisible()

    await navigateTo('/admin/manuscripts')
    await expect(shortIdCells).toHaveCount(1)
  })

  test('the "View archived manuscripts" toggle switches between the two views', async ({
    api,
    page,
    navigateTo,
  }) => {
    const { manuscriptIds } = await api.createManuscripts({ amount: 2 })
    const [archivedId] = manuscriptIds
    await api.patchManuscript({
      manuscriptId: archivedId,
      patch: { isHidden: true },
    })

    await navigateTo('/admin/manuscripts')

    const shortIdCells = page.locator(
      '.ant-table-tbody td[data-testid="shortId"]',
    )

    await expect(shortIdCells).toHaveCount(1)

    const toggle = page.getByRole('switch')
    await toggle.click()

    // wait for the switch's own state to catch up before clicking again -
    // otherwise a second click can land while it's still mid-transition
    await expect(toggle).toHaveAttribute('aria-checked', 'true')
    await expect(page).toHaveURL(/archived=true/)
    await expect(shortIdCells).toHaveCount(1)

    await toggle.click()

    await expect(toggle).toHaveAttribute('aria-checked', 'false')
    await expect(page).not.toHaveURL(/archived=true/)
    await expect(shortIdCells).toHaveCount(1)
  })

  test('downloading selected manuscripts produces a JSON file with the expected content', async ({
    api,
    page,
    navigateTo,
  }) => {
    await api.createManuscripts({ amount: 1 })
    await navigateTo('/admin/manuscripts')

    const rows = page.locator('.ant-table-tbody tr')
    await rows.first().getByRole('checkbox').check()

    const shortId = await rows
      .first()
      .locator('td[data-testid="shortId"]')
      .textContent()

    const downloadButton = page.getByRole('button', { name: 'Download JSON' })
    await expect(downloadButton).toBeEnabled()

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      downloadButton.click(),
    ])

    expect(download.suggestedFilename()).toBe('exportedData.json')

    const downloadPath = await download.path()
    const parsed = JSON.parse(readFileSync(downloadPath as string, 'utf-8'))

    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(1)
    expect(parsed[0].shortId).toBe(Number(shortId))
    expect(parsed[0].submission.$title).toBe('Test manuscript 1')
  })
})

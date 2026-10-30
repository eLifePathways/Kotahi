import { join } from 'path'

import { test, expect, type Locator, type Page } from './utils/fixtures'

const MANUSCRIPT_DOCX = join(__dirname, 'fixtures', 'manuscript.docx')
const MANUSCRIPT_TITLE = 'Soil Microbial Diversity Predicts Drought Resilience'

const uploadCard = (page: Page): Locator =>
  page.getByTestId('card-upload-upload')

const skipCard = (page: Page): Locator => page.getByTestId('card-button-skip')

const titleField = (page: Page): Locator =>
  page.locator('[name="submission.$title"]')

const upload = (
  page: Page,
  file: string | { name: string; mimeType: string; buffer: Buffer },
): Promise<void> =>
  uploadCard(page).locator('input[type="file"]').setInputFiles(file)

const submitPageUrl = (groupName: string, page = 'submit'): RegExp =>
  new RegExp(`/${groupName}/versions/[0-9a-f-]+/${page}$`)

const onCreateSubmission = (
  page: Page,
  handler: (route: Parameters<Parameters<Page['route']>[1]>[0]) => unknown,
): Promise<unknown> =>
  page.route('**/graphql', route =>
    route.request().postData()?.includes('"operationName":"CreateSubmission"')
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

test.describe('new submission page options', () => {
  test('shows both cards when the group sets no submission options', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await expect(uploadCard(page)).toBeVisible()
    await expect(skipCard(page)).toBeVisible()
  })

  test('shows both cards for upload with form', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({
      submission: {
        submissionPage: { submitOptions: 'allowAuthorUploadWithForm' },
      },
    })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await expect(uploadCard(page)).toBeVisible()
    await expect(skipCard(page)).toBeVisible()
  })

  test('shows only the upload card for upload only', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({
      submission: {
        submissionPage: { submitOptions: 'allowAuthorUploadOnly' },
      },
    })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await expect(uploadCard(page)).toBeVisible()
    await expect(skipCard(page)).toHaveCount(0)
  })

  for (const submitOptions of [
    'allowAuthorSubmitForm',
    'allowAuthorSubmitFormWithBlankEditor',
  ]) {
    test(`creates the submission once on load and redirects for ${submitOptions}`, async ({
      api,
      loginAs,
      navigateTo,
      page,
      testGroup,
    }) => {
      await api.updateGroupConfig({
        submission: { submissionPage: { submitOptions } },
      })

      let createSubmissionRequests = 0

      page.on('request', request => {
        if (request.postData()?.includes('"operationName":"CreateSubmission"'))
          createSubmissionRequests += 1
      })

      await loginAs(testGroup.usernames[0])
      await navigateTo('/newSubmission')

      await expect(page).toHaveURL(submitPageUrl(testGroup.groupName))
      expect(createSubmissionRequests).toBe(1)
    })
  }

  test("uses the group's page title", async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({
      submission: { submissionPage: { title: 'Submit your research' } },
    })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await expect(
      page.getByRole('heading', { name: 'Submit your research' }),
    ).toBeVisible()
  })

  test('lists the accepted file types and the size limit', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await expect(uploadCard(page)).toContainText(
      'Accepted file types: .docx, .tex, .latex, .txt, .dvi, .pdf, .epub, .zip. Maximum size: 50 MB.',
    )
  })
})

test.describe('new submission creation', () => {
  test('converts an uploaded .docx and redirects to the submission', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, MANUSCRIPT_DOCX)

    await expect(page).toHaveURL(submitPageUrl(testGroup.groupName), {
      timeout: 30000,
    })

    await expect(titleField(page)).toHaveValue(MANUSCRIPT_TITLE)
  })

  test('shows the uploading step while the file is being sent', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const { promise, release } = deferred()

    await onCreateSubmission(page, async route => {
      await promise
      await route.continue()
    })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, MANUSCRIPT_DOCX)

    await expect(uploadCard(page)).toContainText('Uploading your manuscript...')
    await expect(skipCard(page)).toBeDisabled()

    release()

    await expect(page).toHaveURL(submitPageUrl(testGroup.groupName), {
      timeout: 30000,
    })
  })

  test('redirects to the evaluation page on preprint instances', async ({
    api,
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await api.updateGroupConfig({ instanceName: 'preprint1' })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await skipCard(page).click()

    await expect(page).toHaveURL(
      submitPageUrl(testGroup.groupName, 'evaluation'),
    )
  })

  test('stores other accepted files without converting them, titled after the file', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, {
      name: 'final_draft.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%%EOF\n'),
    })

    await expect(page).toHaveURL(submitPageUrl(testGroup.groupName))
    await expect(titleField(page)).toHaveValue('final draft')
  })

  test('starts a submission without a file', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await skipCard(page).click()

    await expect(page).toHaveURL(submitPageUrl(testGroup.groupName))
    await expect(titleField(page)).toHaveValue(/^New submission /)
  })

  test('replaces the new submission page in the history', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/dashboard')
    await navigateTo('/newSubmission')

    await skipCard(page).click()
    await expect(page).toHaveURL(submitPageUrl(testGroup.groupName))

    await page.goBack()

    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
  })

  test('finishes the submission without redirecting if the user leaves the page', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    const { promise, release } = deferred()

    await onCreateSubmission(page, async route => {
      await promise
      await route.continue()
    })

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, MANUSCRIPT_DOCX)
    await expect(uploadCard(page)).toContainText('Uploading your manuscript...')

    await page.getByTestId('menu-link-dashboard').click()
    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)

    const response = page.waitForResponse(
      res =>
        res.url().endsWith('/graphql') &&
        !!res
          .request()
          .postData()
          ?.includes('"operationName":"CreateSubmission"'),
      { timeout: 30000 },
    )

    release()

    expect(
      (await (await response).json()).data.createSubmission.id,
    ).toBeTruthy()
    await expect(page).toHaveURL(`/${testGroup.groupName}/dashboard`)
  })
})

test.describe('new submission errors', () => {
  test('rejects unsupported file types', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, {
      name: 'paper.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('MZ'),
    })

    await expect(uploadCard(page)).toContainText(
      'This file type is not supported.',
    )

    await expect(page).toHaveURL(`/${testGroup.groupName}/newSubmission`)
  })

  test('explains when the file is too large', async ({
    loginAs,
    navigateTo,
    page,
    testGroup,
  }) => {
    await onCreateSubmission(page, route =>
      route.fulfill({
        json: {
          data: null,
          errors: [
            {
              message: 'paper.docx is larger than 50 MB',
              extensions: { code: 'FILE_TOO_LARGE' },
            },
          ],
        },
      }),
    )

    await loginAs(testGroup.usernames[0])
    await navigateTo('/newSubmission')

    await upload(page, MANUSCRIPT_DOCX)

    await expect(uploadCard(page)).toContainText(
      'This file is larger than 50 MB.',
    )
  })
})

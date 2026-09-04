import { basename } from 'path'
import { test as base, type APIResponse, type Page } from '@playwright/test'

export const jsonOrThrow = async (
  response: APIResponse | Promise<APIResponse>,
): Promise<any> => {
  const resolved = await response

  if (!resolved.ok()) {
    throw new Error(
      `${resolved.url()} returned ${resolved.status()}: ${await resolved.text()}`,
    )
  }

  return resolved.json()
}

type LoginAs = (username: string) => Promise<void>

type NavigateTo = (path: string) => ReturnType<Page['goto']>

type TestGroup = {
  groupName: string
  adminUsername: string
  groupAdminUsername: string
  groupManagerUsername: string
  userWithOrcidUsername: string
  usernames: string[]
}

type FormFieldOption = {
  label: string
  value: string
  labelColor?: string
}

type FormField = {
  name: string
  component: string
  title?: string
  options: FormFieldOption[]
}

type Api = {
  createManuscripts: (opts: {
    amount: number
    submitter?: string
  }) => Promise<{ manuscriptIds: string[] }>
  assignRole: (opts: {
    username: string
    role: string
    manuscriptIds: string[]
  }) => Promise<{ manuscriptCount: number }>
  setReviewerStatus: (opts: {
    manuscriptId: string
    username: string
    status: string
  }) => Promise<unknown>
  updateGroupConfig: (patch: Record<string, unknown>) => Promise<unknown>
  updateFormFields: (opts: {
    purpose: string
    category: string
    fields: FormField[]
  }) => Promise<unknown>
  updateManuscriptSubmission: (opts: {
    manuscriptId: string
    patch: Record<string, unknown>
  }) => Promise<unknown>
  patchManuscript: (opts: {
    manuscriptId: string
    patch: Record<string, unknown>
  }) => Promise<unknown>
  setManuscriptCreated: (opts: {
    manuscriptId: string
    created: string
  }) => Promise<unknown>
}

export const test = base.extend<{
  apiUrl: string
  loginAs: LoginAs
  testGroup: TestGroup
  api: Api
  navigateTo: NavigateTo
}>({
  // No default - always set via `use: { apiUrl }` in playwright.config.ts.
  apiUrl: ['', { option: true }],

  loginAs: async ({ page, request, apiUrl }, use) => {
    await use(async username => {
      const { token } = await jsonOrThrow(
        request.post(`${apiUrl}/createToken/${encodeURIComponent(username)}`),
      )

      await page.addInitScript(
        /* eslint-disable-next-line no-undef */
        tokenValue => window.localStorage.setItem('token', tokenValue),
        token,
      )
    })
  },

  testGroup: async ({ request, apiUrl }, use, testInfo) => {
    const specName = basename(testInfo.file, '.spec.ts')
    const groupName = `pw-${specName}-${testInfo.testId}`

    const group: TestGroup = await jsonOrThrow(
      request.post(`${apiUrl}/testGroup/${groupName}`),
    )

    await use(group)
  },

  api: async ({ request, apiUrl, testGroup }, use) => {
    await use({
      createManuscripts: ({ amount, submitter }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/testManuscripts/${testGroup.groupName}/${amount}${
              submitter
                ? `?submitterUsername=${encodeURIComponent(submitter)}`
                : ''
            }`,
          ),
        ),

      assignRole: ({ username, role, manuscriptIds }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/assignRole/${encodeURIComponent(username)}/${role}?manuscriptIds=${manuscriptIds.join(',')}`,
          ),
        ),

      patchManuscript: ({ manuscriptId, patch }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/patchManuscript/${manuscriptId}?patch=${encodeURIComponent(JSON.stringify(patch))}`,
          ),
        ),

      setReviewerStatus: ({ manuscriptId, username, status }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/setReviewerStatus/${manuscriptId}/${encodeURIComponent(username)}?status=${encodeURIComponent(status)}`,
          ),
        ),

      updateGroupConfig: patch =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/testGroupConfig/${testGroup.groupName}?patch=${encodeURIComponent(JSON.stringify(patch))}`,
          ),
        ),

      updateFormFields: ({ purpose, category, fields }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/updateFormFields/${testGroup.groupName}/${purpose}/${category}?fields=${encodeURIComponent(JSON.stringify(fields))}`,
          ),
        ),

      updateManuscriptSubmission: ({ manuscriptId, patch }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/updateManuscriptSubmission/${manuscriptId}?patch=${encodeURIComponent(JSON.stringify(patch))}`,
          ),
        ),

      setManuscriptCreated: ({ manuscriptId, created }) =>
        jsonOrThrow(
          request.post(
            `${apiUrl}/setManuscriptCreated/${manuscriptId}?created=${encodeURIComponent(created)}`,
          ),
        ),
    })
  },

  navigateTo: async ({ page, testGroup }, use) => {
    await use(path => page.goto(`/${testGroup.groupName}${path}`))
  },
})

export { expect } from '@playwright/test'
export type { APIRequestContext, APIResponse, Page } from '@playwright/test'

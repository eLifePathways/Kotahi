import { defineConfig, devices } from '@playwright/test'

import { clientUrl, apiUrl } from './playwright/utils/constants'

export default defineConfig<{ apiUrl: string }>({
  testDir: './playwright',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  globalTeardown: './playwright/utils/globalTeardown.ts',

  use: {
    apiUrl: apiUrl,
    baseURL: clientUrl,
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
})

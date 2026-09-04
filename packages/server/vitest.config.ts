import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    silent: true,
    testTimeout: 10000,
    globalSetup: ['./vitest.setup.ts'],
    setupFiles: ['./vitest.workerDb.ts'],

    coverage: {
      provider: 'v8',
    },
  },
})

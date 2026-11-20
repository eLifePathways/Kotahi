import path from 'node:path'
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  oxc: {
    decorator: { legacy: true },
  },

  resolve: {
    alias: {
      pages: path.resolve(import.meta.dirname, 'app/pages'),
      ui: path.resolve(import.meta.dirname, 'app/ui'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
  },

  test: {
    environment: 'jsdom',
    include: ['app/**/*.test.{js,jsx,ts,tsx}'],
    server: {
      deps: {
        inline: ['@coko/client'],
      },
    },
  },
})

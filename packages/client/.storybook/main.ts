/* eslint-disable import/no-extraneous-dependencies */

import { defineMain } from '@storybook/react-vite/node'

export default defineMain({
  framework: '@storybook/react-vite',
  stories: ['../stories/**/*.stories.tsx'],
  addons: ['@storybook/addon-docs'],
  viteFinal: async config => {
    config.define = { ...config.define, 'process.env': {} }
    return config
  },
})

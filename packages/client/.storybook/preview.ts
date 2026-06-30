/* eslint-disable import/no-extraneous-dependencies */

import { definePreview } from '@storybook/react-vite'
import * as addonActions from '@storybook/addon-actions/preview'
import * as addonBackgrounds from '@storybook/addon-backgrounds/preview'
import * as addonViewport from '@storybook/addon-viewport/preview'

export default definePreview({
  addons: [addonActions, addonBackgrounds, addonViewport],
  initialGlobals: {
    viewport: { value: '', isRotated: false },
  },
})

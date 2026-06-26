/* eslint-disable import/no-extraneous-dependencies */

import { definePreview, type Decorator } from '@storybook/react-vite'
import addonDocs from '@storybook/addon-docs'

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { makeTheme } from '../app/theme'
import GlobalStyle from '../app/theme/elements/GlobalStyle'

const theme = makeTheme()

const withProviders: Decorator = (Story, context) => {
  const initialEntries = context.parameters?.router?.initialEntries ?? ['/']
  const routePath = context.parameters?.router?.path

  const content = (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <div
        onClick={e => {
          const anchor = (e.target as HTMLElement).closest('a')
          if (anchor) {
            /* eslint-disable-next-line no-console */
            console.log('navigate to:', anchor.getAttribute('href'))
          }
        }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            const anchor = (e.target as HTMLElement).closest('a')
            if (anchor) {
              /* eslint-disable-next-line no-console */
              console.log('navigate to:', anchor.getAttribute('href'))
            }
          }
        }}
        role="presentation"
      >
        <Story />
      </div>
    </ThemeProvider>
  )

  return (
    <MemoryRouter initialEntries={initialEntries}>
      {routePath ? (
        <Routes>
          <Route element={content} path={routePath} />
        </Routes>
      ) : (
        content
      )}
    </MemoryRouter>
  )
}

export default definePreview({
  addons: [addonDocs()],
  tags: ['autodocs'],
  decorators: [withProviders],
})

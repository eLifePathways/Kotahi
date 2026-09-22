/* eslint-disable import/no-extraneous-dependencies */

import { definePreview, type Decorator } from '@storybook/react-vite'
import addonDocs from '@storybook/addon-docs'

import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'
import { I18nextProvider } from 'react-i18next'
import { AntConfigProvider } from '@coko/client'
import { LazyMotion, type FeatureBundle } from 'framer-motion'

import { makeTheme } from '../app/theme'
import GlobalStyle from '../app/theme/elements/GlobalStyle'
import i18next from '../app/i18n'

const theme = makeTheme()

const loadDomAnimationFeatures = (): Promise<FeatureBundle> =>
  import('framer-motion').then(res => res.domAnimation)

const withProviders: Decorator = (Story, context) => {
  const initialEntries = context.parameters?.router?.initialEntries ?? ['/']
  const routePath = context.parameters?.router?.path

  const content = (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={i18next}>
        <AntConfigProvider theme={theme}>
          <LazyMotion features={loadDomAnimationFeatures} strict>
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
          </LazyMotion>
        </AntConfigProvider>
      </I18nextProvider>
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

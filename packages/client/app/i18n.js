/* eslint-disable promise/catch-or-return, promise/always-return */

import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import i18next from 'i18next'
import { getLanguagesLabels, getResources } from './i18n/index'
import { russianPluralRule } from './i18nfuncs'

const initI18n = groupName => {
  const resources = getResources(groupName)

  i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      debug: false,
      resources,
      fallbackLng: 'en',
      compatibilityJSON: 'v3',
      interpolation: {
        escapeValue: true, // escaping is already in React, so disable it
      },
      detection: {
        order: ['navigator'],
      },
    })
    .then(() => {
      i18next.services.pluralResolver.addRule('ru', russianPluralRule)
    })
}

initI18n(null)
let languages = getLanguagesLabels(null)

export const reloadTranslationsForGroup = async (
  groupName,
  groupTranslationOverrides = {},
) => {
  const resources = getResources(groupName, groupTranslationOverrides)

  // Clear existing resources and add the new resources
  Object.keys(resources).forEach(lng => {
    const namespaces = Object.keys(resources[lng])
    namespaces.forEach(ns => {
      i18next.addResourceBundle(lng, ns, resources[lng][ns], true, true)
    })
  })

  // Force reload of resources
  await i18next.reloadResources()

  languages = getLanguagesLabels(groupName)

  await i18next.changeLanguage(
    languages.map(l => l.value).includes(i18next.language)
      ? i18next.language
      : 'en',
  )
}

export default i18next
export const getLanguages = () => languages

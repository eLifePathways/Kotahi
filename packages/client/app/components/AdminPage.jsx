/* eslint-disable react-hooks/exhaustive-deps, react-hooks/immutability, react-hooks/refs */

import { useMutation, useQuery } from '@apollo/client/react'

import { useContext, useEffect, useRef } from 'react'
import i18next from 'i18next'
import { JournalContext } from './xpub-journal'

import { getLanguages } from '../i18n'

import { CURRENT_USER, UPDATE_LANGUAGE } from '../queries'

import { Spinner } from './shared'

const AdminPage = () => {
  const journal = useContext(JournalContext)

  const { loading, data } = useQuery(CURRENT_USER, {
    fetchPolicy: 'network-only',
    pollInterval: 120000,
  })

  const previousDataRef = useRef(null)

  const [updateLanguage] = useMutation(UPDATE_LANGUAGE)
  useEffect(() => {
    if (!data?.currentUser) return

    if (!data.currentUser.preferredLanguage) {
      updateLanguage({
        variables: { id: currentUser.id, preferredLanguage: i18next.language },
      })
    } else {
      const languageValues = getLanguages().map(l => l.value)
      i18next.changeLanguage(
        languageValues.includes(currentUser.preferredLanguage)
          ? currentUser.preferredLanguage
          : 'en',
      )
    }
  }, [data?.currentUser])

  // Do this to prevent polling-related flicker
  if (loading && !previousDataRef.current) {
    return <Spinner />
  }

  const currentUser = data?.currentUser
  journal.textStyles = data?.builtCss?.css

  previousDataRef.current = data

  return null
}

export default AdminPage

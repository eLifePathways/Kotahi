/* eslint-disable react-hooks/immutability */

import { type ReactNode, useContext, useEffect } from 'react'
import { Outlet, Navigate, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client/react'
import i18next from 'i18next'

import { CURRENT_USER, UPDATE_LANGUAGE } from '../queries'
import { Spinner } from '../components/shared'
import { JournalContext } from '../components/xpub-journal'
import { getLanguages } from '../i18n'

const AuthenticatedPage = (): ReactNode => {
  const { groupName } = useParams()
  const journal = useContext(JournalContext)

  const { loading, data, previousData } = useQuery(CURRENT_USER, {
    fetchPolicy: 'network-only',
    pollInterval: 120000,
    skip: !localStorage.getItem('token'),
  })

  // @ts-ignore
  const currentUser = data?.currentUser

  const [updateLanguage] = useMutation(UPDATE_LANGUAGE)

  // TO DO - this likely needs to be checked
  useEffect(() => {
    if (currentUser) {
      if (!currentUser.preferredLanguage) {
        updateLanguage({
          variables: {
            id: currentUser.id,
            preferredLanguage: i18next.language,
          },
        })
      } else {
        const languageValues = getLanguages().map(l => l.value)
        i18next.changeLanguage(
          languageValues.includes(currentUser.preferredLanguage)
            ? currentUser.preferredLanguage
            : 'en',
        )
      }
    }
  }, [currentUser, updateLanguage])

  // Do this to prevent polling-related flicker
  if (loading && !previousData) {
    return <Spinner />
  }

  if (!currentUser) {
    // TO DO - reuse a logout function here that clearn cache etc.
    localStorage.removeItem('token')
    return <Navigate replace to={`/${groupName}/login`} />
  }

  // TO DO - we do not need to keep this info in the context. we just need to
  // read the query data.
  // @ts-ignore
  journal.textStyles = data?.builtCss?.css

  return <Outlet />
}

export default AuthenticatedPage

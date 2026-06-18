/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { useContext, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client/react'

import { serverUrl } from '@coko/client'

import Profile from './Profile'
import { Spinner, CommsErrorBanner } from '../../shared'

import packageJson from '../../../../package.json'
import { ConfigContext } from '../../config/src'

import {
  GET_USER,
  UPDATE_EMAIL,
  UPDATE_USERNAME,
  UPDATE_LANGUAGE,
  GET_GLOBAL_CHAT_NOTIFICATION_OPTION,
  UPDATE_GLOBAL_CHAT_NOTIFICATION_OPTION,
} from '../../../queries'

const { version: kotahiVersion } = packageJson

const ProfilePage = ({ currentUser }) => {
  const { id } = useParams()

  const { urlFrag } = useContext(ConfigContext)
  const [didLogout, setDidLogout] = useState(false)

  const {
    loading,
    error,
    data,
    client,
    refetch: refetchUser,
  } = useQuery(GET_USER, {
    variables: { id: id || currentUser?.id },
    fetchPolicy: 'network-only',
  })

  // Mutations and Queries
  const [updateUserEmail] = useMutation(UPDATE_EMAIL)
  const [updateUsername] = useMutation(UPDATE_USERNAME)
  const [updateLanguage] = useMutation(UPDATE_LANGUAGE)

  const { data: globalChatNotificationUserOption } = useQuery(
    GET_GLOBAL_CHAT_NOTIFICATION_OPTION,
  )

  const [updateGlobalChatNotificationOptIn] = useMutation(
    UPDATE_GLOBAL_CHAT_NOTIFICATION_OPTION,
  )

  const replaceAvatarImage = acceptedFiles => {
    const body = new FormData()
    body.append('file', acceptedFiles[0])

    fetch(`${serverUrl}/api/uploadProfile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body,
    }).then(() => {
      refetchUser()
    })
  }

  if (loading) return <Spinner />
  if (error) return <CommsErrorBanner error={error} />

  if (didLogout) {
    return <Navigate replace to={`${urlFrag}/login`} />
  }

  const localStorage = window.localStorage || undefined

  const logoutUser = () => {
    localStorage.removeItem('token')
    client.clearStore()
    setDidLogout(true)
  }

  // This is a bridge between the fetch results and the Apollo cache/state

  const { user } = data

  return (
    <Profile
      currentUser={currentUser}
      kotahiVersion={kotahiVersion}
      logoutUser={logoutUser}
      notificationUserOption={
        globalChatNotificationUserOption?.notificationOption?.option ||
        'inherit'
      }
      replaceAvatarImage={replaceAvatarImage}
      updateGlobalChatNotificationOptIn={updateGlobalChatNotificationOptIn}
      updateLanguage={updateLanguage}
      updateUserEmail={updateUserEmail}
      updateUsername={updateUsername}
      user={user}
    />
  )
}

export default ProfilePage

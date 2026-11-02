/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@apollo/client/react'

import { serverUrl } from '@coko/client'

import Profile from './Profile'
import { CommsErrorBanner } from '../../shared'
import Spinner from '../../../ui/shared/Spinner'

import packageJson from '../../../../package.json'
import { useCurrentUser } from '../../../pages/hooks/useCurrentUser'
import { useLogout } from '../../../pages/hooks/useLogout'

import {
  GET_USER,
  UPDATE_EMAIL,
  UPDATE_USERNAME,
  UPDATE_LANGUAGE,
  GET_GLOBAL_CHAT_NOTIFICATION_OPTION,
  UPDATE_GLOBAL_CHAT_NOTIFICATION_OPTION,
} from '../../../queries'

const { version: kotahiVersion } = packageJson

const ProfilePage = () => {
  const { id, groupName } = useParams()
  const currentUser = useCurrentUser()
  const navigate = useNavigate()
  const logout = useLogout()

  const {
    loading,
    error,
    data,
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

  if (loading) return <Spinner fullpage />
  if (error) return <CommsErrorBanner error={error} />

  const logoutUser = () => {
    logout()
    navigate(`/${groupName}/login`, { replace: true })
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

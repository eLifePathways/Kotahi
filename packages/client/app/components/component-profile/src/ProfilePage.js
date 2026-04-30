/* eslint-disable react/prop-types */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */

import { useContext, useState } from 'react'
import { Redirect } from 'react-router-dom'
import { gql, useQuery, useMutation } from '@apollo/client'

import { serverUrl } from '@coko/client'

import Profile from './Profile'
import { Spinner, CommsErrorBanner } from '../../shared'

import packageJson from '../../../../package.json'
import { ConfigContext } from '../../config/src'

const { version: kotahiVersion } = packageJson

const GET_USER = gql`
  query user($id: ID) {
    user(id: $id) {
      id
      username
      profilePicture
      isOnline
      email
      globalRoles
      groupRoles
      defaultIdentity {
        identifier
        email
        type
        aff
        id
      }
    }
  }
`

const UPDATE_EMAIL = gql`
  mutation updateEmail($id: ID!, $email: String!) {
    updateEmail(id: $id, email: $email) {
      success
      error
      user {
        id
        email
      }
    }
  }
`

const UPDATE_USERNAME = gql`
  mutation updateUsername($id: ID!, $username: String!) {
    updateUsername(id: $id, username: $username) {
      id
      username
    }
  }
`

export const UPDATE_LANGUAGE = gql`
  mutation updateLanguage($id: ID!, $preferredLanguage: String!) {
    updateLanguage(id: $id, preferredLanguage: $preferredLanguage) {
      id
      preferredLanguage
    }
  }
`

const GET_GLOBAL_CHAT_NOTIFICATION_OPTION = gql`
  query {
    notificationOption(path: ["chat"]) {
      userId
      path
      groupId
      option
    }
  }
`

const UPDATE_GLOBAL_CHAT_NOTIFICATION_OPTION = gql`
  mutation updateNotificationOption($option: String!) {
    updateNotificationOption(path: ["chat"], option: $option) {
      id
      created
      updated
      userId
      path
      option
      objectId
    }
  }
`

const ProfilePage = ({ currentUser, match }) => {
  const { id } = match.params

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
    return <Redirect to={`${urlFrag}/login`} />
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
      match={match}
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

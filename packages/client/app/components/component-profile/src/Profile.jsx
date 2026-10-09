/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { fileTypeFromBlob } from 'file-type'
import Popup from 'reactjs-popup'

import { th, grid, serverUrl } from '@coko/client'

import { Button, Checkbox } from '../../pubsweet'
import Modal from '../../component-modal/src/ConfirmationModal'
import { convertCamelCaseToTitleCase } from '../../../shared/textUtils'

import { SectionContent, SectionRow } from '../../shared'
import Page from '../../../ui/shared/Page'
import ChangeUsername from './ChangeUsername'
import { BigProfileImage } from './ProfileImage'
import ChangeEmail from './ChangeEmail'
import EnterEmail from './EnterEmail'
import ChangeLanguage from './ChangeLanguage'
import { getLanguages } from '../../../i18n'

const VersionText = styled.div`
  color: ${th('color.gray50')};
  position: fixed;
  bottom: ${grid(4)};
  right: ${grid(6)};
`

const RolesRow = styled.div`
  display: flex;
  align-items: end;
  margin-bottom: ${grid(2)};
`

const StyledCheckbox = styled(Checkbox)`
  padding: ${grid(4)} ${grid(6)};
`

const SpecialRolesLabel = styled.div`
  color: ${th('color.brand1.shade25')};
`

const UserPrivilegeAlert = styled.div`
  background: ${th('colorWarningLight')};
  border-left: 3px solid ${th('colorWarning')};
  color: ${th('colorWarningDark')};
  line-height: 1.8;
  margin-top: 0.5em;
  padding: 0.5em 1em 0.5em 0.5em;
  width: 100%;
`

const ErrorContainer = styled.div`
  background: ${th('colorWarningLight')};
  border: 3px solid ${th('colorWarning')};
  color: ${th('colorWarningDark')};
  padding: 10px 5px;
  width: 100%;
`

const acceptedMimes = ['image/jpeg', 'image/png', 'image/webp']

const ProfileDropzone = ({ profilePicture, replaceAvatarImage, t }) => {
  const [isErrorOpen, setErrorOpen] = useState(false)

  const onDrop = async acceptedFiles => {
    setErrorOpen(false)

    const disallowedExtensions = ['.jfif']
    const validatedFiles = []

    await Promise.all(
      acceptedFiles.map(async file => {
        const ext = `.${file.name.toLowerCase().split('.').pop()}`

        if (disallowedExtensions.includes(ext)) {
          console.warn(`Rejected based on extension: ${file.name}`)
          return
        }

        const result = await fileTypeFromBlob(file)

        if (result && acceptedMimes.includes(result.mime)) {
          validatedFiles.push(file)
        } else {
          console.warn(
            `Rejected file: ${file.name} — Detected as: ${
              result?.mime || 'unknown'
            }`,
          )
        }
      }),
    )

    if (acceptedFiles?.length && !validatedFiles.length) {
      setErrorOpen(true)
      return
    }

    replaceAvatarImage(validatedFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedMimes,
    onDrop,
  })

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      <BigProfileImage src={profilePicture} />
      <Button>
        {isDragActive
          ? t('profilePage.Drop it here')
          : t('profilePage.Change profile picture')}
      </Button>
      <Popup closeOnDocumentClick closeOnEscape modal open={isErrorOpen}>
        <ErrorContainer>Invalid file! Please use an image!</ErrorContainer>
      </Popup>
    </div>
  )
}

const SpecialRoles = ({ user, isCurrentUsersOwnProfile, t }) => {
  let specialRoles = user.globalRoles
    .concat(user.groupRoles)
    .map(convertCamelCaseToTitleCase)

  specialRoles = specialRoles.map(elem => {
    return t(`common.roles.${elem}`)
  })

  if (!specialRoles.length)
    return isCurrentUsersOwnProfile ? (
      <UserPrivilegeAlert>
        {t('profilePage.userPrivilegeAlert')}
      </UserPrivilegeAlert>
    ) : null

  return <SpecialRolesLabel>({specialRoles.join(', ')})</SpecialRolesLabel>
}

const Profile = ({
  currentUser,
  kotahiVersion,
  logoutUser,
  replaceAvatarImage,
  updateUserEmail,
  updateUsername,
  updateLanguage,
  updateGlobalChatNotificationOptIn,
  user,
  notificationUserOption,
}) => {
  const languages = getLanguages()

  const [hasGlobalChatNotificationOptIn, setHasGlobalChatNotificationOptIn] =
    useState(notificationUserOption)

  const { t } = useTranslation()
  useEffect(() => {
    if (notificationUserOption) {
      setHasGlobalChatNotificationOptIn(notificationUserOption)
    }
  }, [notificationUserOption])
  const isCurrentUsersOwnProfile = user.id === currentUser.id

  const canEditProfile =
    isCurrentUsersOwnProfile || currentUser.globalRoles.includes('admin')

  const toggleGlobalChatNotificationOptIn = async () => {
    const updatedGlobalChatNotificationOptIn =
      hasGlobalChatNotificationOptIn === 'off' ? 'inherit' : 'off'

    setHasGlobalChatNotificationOptIn(updatedGlobalChatNotificationOptIn)

    await updateGlobalChatNotificationOptIn({
      variables: {
        option: updatedGlobalChatNotificationOptIn,
      },
    })
  }

  const profilePicture =
    user.profilePicture || `${serverUrl}/profiles/default_avatar.svg`

  return (
    <Page
      title={
        isCurrentUsersOwnProfile
          ? t('profilePage.Your profile')
          : t('profilePage.Profile: ') + user.username
      }
    >
      <Modal isOpen={isCurrentUsersOwnProfile && !user.email}>
        <EnterEmail updateUserEmail={updateUserEmail} user={user} />
      </Modal>

      <RolesRow>
        <SpecialRoles
          isCurrentUsersOwnProfile={isCurrentUsersOwnProfile}
          t={t}
          user={user}
        />
        {isCurrentUsersOwnProfile && (
          <Button
            $primary
            onClick={() => logoutUser()}
            style={{ marginLeft: 'auto' }}
          >
            {t('profilePage.Logout')}
          </Button>
        )}
      </RolesRow>

      <SectionContent>
        <SectionRow key="profilepicture">
          <div>
            {isCurrentUsersOwnProfile ? (
              <ProfileDropzone
                profilePicture={profilePicture}
                replaceAvatarImage={replaceAvatarImage}
                t={t}
              />
            ) : (
              <BigProfileImage src={profilePicture} />
            )}
          </div>
        </SectionRow>

        <SectionRow>
          <label>{t('profilePage.ORCID')}</label>{' '}
          <div>{user.defaultIdentity.identifier}</div>
        </SectionRow>

        <SectionRow>
          <label htmlFor="2">{t('profilePage.Username')}</label>
          <div>
            {canEditProfile ? (
              <ChangeUsername updateUsername={updateUsername} user={user} />
            ) : (
              <div>{user.username}</div>
            )}
          </div>
        </SectionRow>

        <SectionRow>
          <label>{t('profilePage.Email')}</label>
          <div>
            {canEditProfile ? (
              <ChangeEmail updateUserEmail={updateUserEmail} user={user} />
            ) : (
              <div>{user.email}</div>
            )}
          </div>
        </SectionRow>

        <SectionRow>
          <label>{t('profilePage.Language')}</label>
          <div>
            {canEditProfile ? (
              <ChangeLanguage updateLanguage={updateLanguage} user={user} />
            ) : (
              <div>
                {languages.find(elem => elem.value === i18next.language).label}
              </div>
            )}
          </div>
        </SectionRow>
      </SectionContent>

      <SectionContent>
        <StyledCheckbox
          checked={hasGlobalChatNotificationOptIn === 'off'}
          label={t('profilePage.Mute all discussion email notifications')}
          onChange={toggleGlobalChatNotificationOptIn}
        />
      </SectionContent>

      <VersionText>
        <span>{kotahiVersion}</span>
      </VersionText>
    </Page>
  )
}

export default Profile

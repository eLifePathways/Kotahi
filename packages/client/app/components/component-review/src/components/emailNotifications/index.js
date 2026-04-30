/* eslint-disable react/prop-types */

import { useState, useContext } from 'react'
import { th } from '@coko/client'
import styled, { css } from 'styled-components'
import { useTranslation } from 'react-i18next'
import { SectionHeader, SectionRowGrid, Title } from '../style'
import { SectionContent } from '../../../../shared'
import SelectReceiver from './SelectReceiver'
import SelectEmailTemplate from './SelectEmailTemplate'
import ActionButton from '../../../../shared/ActionButton'
import { sendEmail, sendEmailChannelMessage } from './emailUtils'
import { ConfigContext } from '../../../../config/src'
import {
  isReviewerInvitation,
  isCollaborativeReviewerInvitation,
} from '../../../../component-task-manager/src/notificationUtils'

const UserEmailWrapper = styled.div`
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};
`

const editorOption = user => ({
  label: (
    <>
      <div>{user.username}</div>{' '}
      <UserEmailWrapper>{user.email}</UserEmailWrapper>{' '}
    </>
  ),
  value: user.email,
  userName: user.username,
})

export const EmailErrorMessageWrapper = styled.div`
  color: ${th('colorError')};
  font-family: ${th('fontInterface')};
  font-size: ${th('fontSizeBaseSmall')};
  line-height: ${th('lineHeightBaseSmall')};

  ${props =>
    props.isVisible === true
      ? css`
          display: flex;
        `
      : css`
          display: none;
        `}

  padding: calc(8px * 2) calc(8px * 3);

  &:not(:last-child) {
    margin-bottom: ${th('gridUnit')};
  }
`

const RowGridStyled = styled(SectionRowGrid)`
  grid-template-columns: repeat(5, minmax(0, 1fr));
`

const EmailNotifications = ({
  manuscript,
  allUsers,
  currentUser,
  sendNotifyEmail,
  sendChannelMessage,
  selectedEmail,
  externalEmail,
  setSelectedEmail,
  setExternalEmail,
  selectedEmailIsBlacklisted,
  emailTemplates,
  addReviewer,
}) => {
  const config = useContext(ConfigContext)
  const [externalName, setExternalName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)
  const { t } = useTranslation()

  const resetAll = () => {
    setExternalEmail('')
    setSelectedEmail('')
    setExternalName('')
    setSelectedTemplate('')
  }

  const handlerForNewUserToggle = () => {
    resetAll()
    setIsNewUser(s => !s)
  }

  const options = (allUsers || [])
    .filter(user => user.email)
    .map(user => editorOption(user))

  const onClickActionButton = async () => {
    setNotificationStatus('pending')

    if (
      isReviewerInvitation(selectedTemplate, emailTemplates) ||
      isCollaborativeReviewerInvitation(selectedTemplate, emailTemplates)
    ) {
      const user = allUsers.find(u => u.email === selectedEmail)
      if (user)
        await addReviewer({
          variables: {
            userId: user.id,
            manuscriptId: manuscript.id,
            isCollaborative: !!isCollaborativeReviewerInvitation(
              selectedTemplate,
              emailTemplates,
            ),
          },
        })
    }

    const output = await sendEmail(
      manuscript,
      isNewUser,
      currentUser,
      sendNotifyEmail,
      selectedTemplate,
      selectedEmail,
      externalEmail,
      externalName,
      selectedEmailIsBlacklisted,
      config.groupId,
    )

    if (!output?.emailStatus) {
      setNotificationStatus('failure')
      return
    }

    const { invitation, input } = output

    setNotificationStatus(invitation ? 'success' : 'failure')

    if (input) {
      sendEmailChannelMessage(
        sendChannelMessage,
        currentUser,
        input,
        options,
        emailTemplates,
      )
    }
  }

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.tasksTab.Notifications')}</Title>
      </SectionHeader>
      <RowGridStyled>
        <SelectReceiver
          externalEmail={externalEmail}
          externalName={externalName}
          isNewUser={isNewUser}
          onChangeReceiver={setSelectedEmail}
          options={options}
          selectedReceiver={selectedEmail}
          setExternalEmail={setExternalEmail}
          setExternalName={setExternalName}
          setIsNewUser={handlerForNewUserToggle}
        />
        <SelectEmailTemplate
          emailTemplates={emailTemplates}
          onChangeEmailTemplate={setSelectedTemplate}
          selectedEmailTemplate={selectedTemplate}
        />
        <ActionButton
          onClick={onClickActionButton}
          primary
          status={notificationStatus}
        >
          {t('decisionPage.tasksTab.Notify')}
        </ActionButton>
      </RowGridStyled>
      <EmailErrorMessageWrapper isVisible={selectedEmailIsBlacklisted}>
        {t('decisionPage.tasksTab.User email address opted out')}
      </EmailErrorMessageWrapper>
    </SectionContent>
  )
}

export default EmailNotifications

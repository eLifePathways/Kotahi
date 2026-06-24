/* eslint-disable react/prop-types */

import { Formik } from 'formik'
import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import {
  SectionContent,
  SectionHeader,
  SectionRow,
  Title,
} from '../../../../shared'
import {
  sendEmail,
  sendEmailChannelMessage,
} from '../emailNotifications/emailUtils'
import InviteReviewerModal from './InviteReviewerModal'
import ReviewerForm from './ReviewerForm'
import { selectReviewerInvitationEmail } from './util'
import { ConfigContext } from '../../../../config/src'

const InviteReviewer = ({
  reviewerUsers,
  manuscript,
  addReviewer,
  updateSharedStatusForInvitedReviewer,
  currentUser,
  sendNotifyEmail,
  sendChannelMessage,
  selectedEmail,
  selectedEmailIsBlacklisted,
  setExternalEmail,
  updateTeamMember,
  emailTemplates,
}) => {
  const config = useContext(ConfigContext)
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  const [userId, setUserId] = useState(undefined)

  const [isNewUser, setIsNewUser] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(null)

  return (
    <>
      <Formik
        displayName="reviewers"
        initialValues={{
          user: undefined,
          email: undefined,
          name: undefined,
          collaborate: false,
        }}
        onSubmit={async values => {
          if (!isNewUser) {
            setOpen(true)
            setUserId(values.user.id)
          } else {
            setNotificationStatus('pending')

            const reviewerInvitationEmailTemplate =
              selectReviewerInvitationEmail(
                config,
                emailTemplates,
                values.collaborate,
              )

            const output = await sendEmail(
              manuscript,
              isNewUser,
              currentUser,
              sendNotifyEmail,
              reviewerInvitationEmailTemplate,
              selectedEmail,
              values.email,
              values.name,
              selectedEmailIsBlacklisted,
              config.groupId,
            )

            setNotificationStatus(output?.invitation ? 'success' : 'failure')

            if (output?.input) {
              sendEmailChannelMessage(
                sendChannelMessage,
                currentUser,
                output.input,
                reviewerUsers.map(reviewer => ({
                  userName: reviewer.username,
                  value: reviewer.email,
                })),
                emailTemplates,
              )
            }
          }
        }}
      >
        {formikProps => (
          <SectionContent>
            <SectionHeader>
              <Title>{t('decisionPage.Invite Reviewers')}</Title>
            </SectionHeader>
            <SectionRow>
              <ReviewerForm
                {...formikProps}
                isNewUser={isNewUser}
                notificationStatus={notificationStatus}
                optedOut={selectedEmailIsBlacklisted}
                reviewerUsers={reviewerUsers}
                setExternalEmail={setExternalEmail}
                setIsNewUser={setIsNewUser}
              />
            </SectionRow>
          </SectionContent>
        )}
      </Formik>
      <InviteReviewerModal
        addReviewer={addReviewer}
        currentUser={currentUser}
        emailTemplates={emailTemplates}
        manuscript={manuscript}
        onClose={() => setOpen(false)}
        open={open}
        reviewerUsers={reviewerUsers}
        sendChannelMessage={sendChannelMessage}
        sendNotifyEmail={sendNotifyEmail}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
        userId={userId}
      />
    </>
  )
}

export default InviteReviewer

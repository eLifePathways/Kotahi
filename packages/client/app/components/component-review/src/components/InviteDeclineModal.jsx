/* eslint-disable react/prop-types */

import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { convertTimestampToDateString } from '../../../../shared/dateUtils'
import { UserAvatar } from '../../../component-avatar/src'
import Modal from '../../../component-modal/src/Modal'
import { ConfigurableStatus } from '../../../shared'
import { color } from '../../../../theme'

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const ResponseCommentRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SuggestedReviewerRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const SuggestedReviewerContainer = styled.div`
  display: flex;
  padding: 5px;
`

const SuggestedReviewerFieldLabel = styled.span`
  font-weight: bold;
  margin-right: 5px;
`

const SuggestedReviewerFieldValue = styled.span`
  margin-right: 8px;
`

const SuggestedReviewerInnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

const SuggestedReviewerInnerRow = styled.div`
  display: flex;
  width: 100%;
`

const ModalBodyRow = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: 10px;
`

const StyledH4 = styled.h4`
  font-weight: 600;
`

const DeclinedBadge = styled(ConfigurableStatus)`
  background: #c23d20;
`

const TextChange = styled.div`
  color: ${props => (props.gray ? color.brand2.base : color.text)};
  padding: 5px;
`

const InviteDeclineModal = ({ invitation, isOpen, onClose }) => {
  const name = invitation.invitedPersonName ?? invitation.user.username
  const { t } = useTranslation()

  const declinedDateString = convertTimestampToDateString(
    invitation.responseDate ?? invitation.updated,
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      subtitle={t('modals.inviteDeclined.Declined', {
        dateString: declinedDateString,
      })}
      title={t('modals.inviteDeclined.Invitation Decline', { name })}
    >
      <ModalBody style={{ width: '600px' }}>
        <ModalBodyRow style={{ gap: '0px' }}>
          <UserAvatar
            size={56}
            style={{ marginRight: '15px' }}
            user={invitation.user}
          />
          <StyledH4 style={{ marginRight: '5px' }}>
            {t('modals.inviteDeclined.Reviewer')}{' '}
          </StyledH4>
          <p>{name}</p>
        </ModalBodyRow>
        <ModalBodyRow>
          <StyledH4>{t('modals.inviteDeclined.Status')}</StyledH4>
          <DeclinedBadge lightText>
            {t('modals.inviteDeclined.declinedBadge')}
          </DeclinedBadge>
          {invitation.declinedReason === 'DO_NOT_CONTACT' && (
            <DeclinedBadge lightText>
              {t('modals.inviteDeclined.Opted Out')}
            </DeclinedBadge>
          )}
        </ModalBodyRow>
        <ResponseCommentRow>
          <StyledH4>{t('modals.inviteDeclined.Declined Reason')}</StyledH4>
          <TextChange gray={!invitation.responseComment}>
            {invitation.responseComment ||
              t('modals.inviteDeclined.No reason provided')}
          </TextChange>
        </ResponseCommentRow>
        <SuggestedReviewerRow>
          <StyledH4>Suggested Reviewers</StyledH4>
          {(invitation.suggestedReviewers || []).map((reviewer, i) => (
            <SuggestedReviewerContainer key={`suggestedReviewer-${i}`}>
              <SuggestedReviewerInnerContainer>
                <SuggestedReviewerInnerRow>
                  <SuggestedReviewerFieldLabel>
                    Full Name:
                  </SuggestedReviewerFieldLabel>
                  <SuggestedReviewerFieldValue>
                    {`${reviewer.firstName} ${reviewer.lastName}`}
                  </SuggestedReviewerFieldValue>
                  <SuggestedReviewerFieldLabel>
                    Email:
                  </SuggestedReviewerFieldLabel>
                  <SuggestedReviewerFieldValue>
                    {reviewer.email}
                  </SuggestedReviewerFieldValue>
                </SuggestedReviewerInnerRow>
                <SuggestedReviewerInnerRow>
                  <SuggestedReviewerFieldLabel>
                    Affiliation:
                  </SuggestedReviewerFieldLabel>
                  <SuggestedReviewerFieldValue>
                    {reviewer.affiliation}
                  </SuggestedReviewerFieldValue>
                </SuggestedReviewerInnerRow>
              </SuggestedReviewerInnerContainer>
            </SuggestedReviewerContainer>
          ))}
        </SuggestedReviewerRow>
      </ModalBody>
    </Modal>
  )
}

export default InviteDeclineModal

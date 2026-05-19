/* eslint-disable react/prop-types */

import { grid, th } from '@coko/client'
import PropTypes from 'prop-types'
import { useState, useContext } from 'react'
import { Mail } from 'react-feather'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { ConfigContext } from '../../../../config/src'
import { isCurrentUserCollaborative } from '../review/util'
import { convertTimestampToRelativeDateString } from '../../../../../shared/dateUtils'
import { UserAvatar } from '../../../../component-avatar/src'
import ReviewDetailsModal from '../../../../component-review-detail-modal/src'
import { color } from '../../../../../theme'
import { ColorBadge } from '../../../../shared'

const Card = styled.div`
  background-color: ${color.gray97};
  border-bottom: 0.8px solid ${color.gray70};
  border-radius: 8px;
  display: flex;
  flex-direction: row;
  font-size: ${th('fontSizeBaseSmall')};
  justify-content: space-between;
  padding: ${grid(1)};
  position: relative;
  width: 100%;

  &:hover {
    box-shadow: 0 9px 5px -6px ${color.gray70};
    cursor: pointer;
    transition: 0.3s ease;
    z-index: 1;
  }
`

const InfoGrid = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: ${grid(1)};
`

const NameDisplay = styled.div`
  font-weight: bold;
`

const DateDisplay = styled.div`
  color: ${color.gray50};
  font-size: 12px;
  line-height: 1.2;
`

const LeftSide = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
`

const EmailDisplay = styled(DateDisplay)`
  align-items: center;
  color: ${props =>
    props.invitationStatus === 'rejected'
      ? th('colorError')
      : color.brand1.base};
  display: flex;
  margin-top: calc(${th('gridUnit')} / 2);
`

const MailIcon = styled(Mail)`
  height: 12px;
  margin-right: calc(${th('gridUnit')} / 2);
  width: auto;
`

const CollaborativeBadge = styled.div`
  flex-basis: 100%;
  padding-top: 10px;
`

const KanbanCard = ({
  createFile,
  currentUser,
  deleteFile,
  reviewer,
  isAuthorCard,
  isInvitation,
  manuscript,
  removeAuthor,
  removeReviewer,
  removeInvitation,
  status,
  reviewForm,
  review,
  isCurrentVersion,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  updateReview,
  updateReviewJsonData,
  showEmailInvitation,
}) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const config = useContext(ConfigContext)

  const isCollaborative =
    reviewer.invitedPersonType === 'COLLABORATIVE_REVIEWER' ||
    (isCurrentUserCollaborative(manuscript, reviewer.user) && !isAuthorCard)

  return (
    <>
      <ReviewDetailsModal
        createFile={createFile}
        currentUser={currentUser}
        deleteFile={deleteFile}
        isAuthorCard={isAuthorCard}
        isInvitation={isInvitation}
        isOpen={open}
        manuscriptId={manuscript.id}
        manuscriptShortId={manuscript.shortId}
        onClose={() => setOpen(false)}
        readOnly={!isCurrentVersion}
        removeAuthor={removeAuthor}
        removeInvitation={removeInvitation}
        removeReviewer={removeReviewer}
        review={review}
        reviewerTeamMember={reviewer}
        reviewForm={reviewForm}
        status={status}
        updateCollaborativeTeamMember={updateCollaborativeTeamMember}
        updateReview={updateReview}
        updateReviewJsonData={updateReviewJsonData}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
      />
      <Card data-testid="reviewer-card" onClick={() => setOpen(true)}>
        <LeftSide>
          <UserAvatar
            isClickable={!!reviewer.user}
            showHoverProfile={false}
            user={
              reviewer.user ?? {
                username: reviewer.invitedPersonName,
                isOnline: false,
              }
            }
          />
          <InfoGrid>
            <NameDisplay>
              {reviewer.user?.username ?? reviewer.invitedPersonName}
            </NameDisplay>
            <DateDisplay>
              {t('common.kanban.Last updated')}
              {` ${convertTimestampToRelativeDateString(reviewer.updated)}`}
            </DateDisplay>
            {showEmailInvitation && (
              <EmailDisplay>
                <MailIcon
                  invitationStatus={reviewer.status} // TODO why are we setting an arbitrary 'invitationStatus' attribute on this svg element?
                />{' '}
                {t('common.kanban.Invited via email')}
              </EmailDisplay>
            )}
          </InfoGrid>
          {isCollaborative && (
            <CollaborativeBadge>
              <ColorBadge color={config.groupIdentity.primaryColor}>
                {t('common.kanban.isCollaborative')}
              </ColorBadge>
            </CollaborativeBadge>
          )}
        </LeftSide>
      </Card>
    </>
  )
}

KanbanCard.propTypes = {
  reviewer: PropTypes.shape({
    id: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    user: PropTypes.shape({
      id: PropTypes.string.isRequired,
      username: PropTypes.string.isRequired,
      defaultIdentity: PropTypes.shape({
        identifier: PropTypes.string.isRequired,
      }),
    }),
  }).isRequired,
  isInvitation: PropTypes.bool.isRequired,
}

export default KanbanCard

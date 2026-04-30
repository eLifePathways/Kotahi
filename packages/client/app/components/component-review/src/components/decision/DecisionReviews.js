/* eslint-disable react/prop-types */

import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import DecisionReview from './DecisionReview'
import { SectionHeader, SectionRow, Title } from '../style'
import { SectionContent } from '../../../../shared'
import InvitationResults from './InvitationResults'

const getReviewerTeamMember = (
  manuscript,
  currentUser,
  isCollaborative = false,
) => {
  const role = isCollaborative ? 'collaborativeReviewer' : 'reviewer'

  const team = manuscript.teams.find(team_ => team_.role === role) || {}

  if (!team.members) {
    return null
  }

  if (isCollaborative) {
    // get any of the two members. We update all users of that team
    return team.members[0]
  }

  const currentMember = team.members.find(m => m.user?.id === currentUser?.id)
  return currentMember
}

const DecisionReviews = ({
  canEditReviews,
  createFile,
  deleteFile,
  reviewForm,
  manuscript,
  lockUnlockReview,
  updateReview,
  canHideReviews,
  threadedDiscussionProps,
  invitations,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateCollaborativeTeamMember,
  updateReviewJsonData,
  currentUser,
}) => {
  const collaborativeReviewToShow =
    manuscript.reviews.find(r => r.isCollaborative && !r.isDecision) ?? null

  const reviewsToShow = manuscript?.reviews?.length
    ? manuscript.reviews
        .filter(r => !r.isCollaborative)
        .filter(review => {
          if (review.user) {
            const reviewerTeamMember = getReviewerTeamMember(
              manuscript,
              review.user,
            )

            return (
              reviewerTeamMember?.status === 'completed' && !review.isDecision
            )
          }

          return !review.isDecision
        })
    : []

  const { t } = useTranslation()

  const reviewerInvitations = invitations.filter(
    invitation => invitation.invitedPersonType === 'REVIEWER',
  )

  const collaborativeReviewerInvitations = invitations.filter(
    invitation => invitation.invitedPersonType === 'COLLABORATIVE_REVIEWER',
  )

  return (
    <SectionContent>
      <SectionHeader>
        <Title>{t('decisionPage.decisionTab.Completed Reviews')}</Title>
      </SectionHeader>
      <InvitationResults invitations={reviewerInvitations} />
      {reviewsToShow.length > 0 ? (
        reviewsToShow
          .sort((reviewOne, reviewTwo) => {
            // Get the username of reviewer and convert to uppercase
            const usernameOne = reviewOne?.user?.username.toUpperCase()
            const usernameTwo = reviewTwo?.user?.username.toUpperCase()

            // Sort by username
            if (usernameOne < usernameTwo) return -1
            if (usernameOne > usernameTwo) return 1

            // If the username don't match then sort by reviewId
            if (reviewOne.id < reviewTwo.id) return -1
            if (reviewOne.id > reviewTwo.id) return 1

            return 0
          })
          .map((review, index) => (
            <SectionRow key={review.id}>
              <DecisionReview
                canEditReviews={canEditReviews}
                canHideReviews={canHideReviews}
                createFile={createFile}
                currentUser={currentUser}
                deleteFile={deleteFile}
                isControlPage
                lockUnlockReview={lockUnlockReview}
                manuscriptId={manuscript.id}
                open
                ordinal={index + 1}
                review={review}
                reviewerTeamMember={getReviewerTeamMember(
                  manuscript,
                  review.user,
                )}
                reviewForm={reviewForm}
                teams={manuscript.teams}
                threadedDiscussionProps={threadedDiscussionProps}
                updateCollaborativeTeamMember={updateCollaborativeTeamMember}
                updateReview={updateReview}
                updateReviewJsonData={updateReviewJsonData}
                updateSharedStatusForInvitedReviewer={
                  updateSharedStatusForInvitedReviewer
                }
                updateTeamMember={updateTeamMember}
              />
            </SectionRow>
          ))
      ) : (
        <SectionRow>{t('decisionPage.decisionTab.noReviews')}</SectionRow>
      )}
      <SectionHeader>
        <Title>{t('decisionPage.decisionTab.Collaborative Reviews')}</Title>
      </SectionHeader>
      <InvitationResults invitations={collaborativeReviewerInvitations} />
      {collaborativeReviewToShow ? (
        <SectionRow key={collaborativeReviewToShow.id}>
          <DecisionReview
            canEditReviews={canEditReviews}
            canHideReviews={canHideReviews}
            createFile={createFile}
            currentUser={currentUser}
            deleteFile={deleteFile}
            isControlPage
            lockUnlockReview={lockUnlockReview}
            manuscriptId={manuscript.id}
            open
            ordinal={1}
            review={collaborativeReviewToShow}
            reviewerTeamMember={getReviewerTeamMember(
              manuscript,
              collaborativeReviewToShow.user,
              collaborativeReviewToShow.isCollaborative,
            )}
            reviewForm={reviewForm}
            teams={manuscript.teams}
            threadedDiscussionProps={threadedDiscussionProps}
            updateCollaborativeTeamMember={updateCollaborativeTeamMember}
            updateReview={updateReview}
            updateReviewJsonData={updateReviewJsonData}
            updateSharedStatusForInvitedReviewer={
              updateSharedStatusForInvitedReviewer
            }
            updateTeamMember={updateTeamMember}
          />
        </SectionRow>
      ) : (
        <SectionRow>{t('decisionPage.decisionTab.noReviews')}</SectionRow>
      )}
    </SectionContent>
  )
}

DecisionReviews.propTypes = {
  manuscript: PropTypes.shape({
    id: PropTypes.string.isRequired,
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        user: PropTypes.shape({
          id: PropTypes.string.isRequired,
        }),
      }).isRequired,
    ).isRequired,
    teams: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string.isRequired,
        members: PropTypes.arrayOf(
          PropTypes.shape({
            user: PropTypes.shape({
              id: PropTypes.string.isRequired,
            }).isRequired,
          }).isRequired,
        ).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
}

export default DecisionReviews

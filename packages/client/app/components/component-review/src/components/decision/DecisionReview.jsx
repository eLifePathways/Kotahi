/* eslint-disable react/prop-types */

import { useContext, useState } from 'react'
import { isObject, find } from 'lodash'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { th } from '@coko/client'
import { JournalContext } from '../../../../xpub-journal'
import { ensureJsonIsParsed } from '../../../../../shared/objectUtils'
import ReviewHeading from './ReviewHeading'
import ReviewDetailsModal from '../../../../component-review-detail-modal/src'

const Root = styled.div`
  margin-bottom: calc(${th('gridUnit')} * 3);
`

const DecisionReview = ({
  createFile,
  deleteFile,
  canEditReviews,
  review,
  reviewForm,
  ordinal,
  manuscriptId,
  lockUnlockReview,
  teams,
  isControlPage,
  updateReview,
  canHideReviews,
  showEditorOnlyFields,
  threadedDiscussionProps,
  reviewerTeamMember,
  readOnly,
  updateSharedStatusForInvitedReviewer,
  updateTeamMember,
  updateReviewJsonData,
  updateCollaborativeTeamMember,
  currentUser,
}) => {
  const {
    isHiddenFromAuthor,
    isHiddenReviewerName,
    id,
    canBePublishedPublicly,
    user,
    isCollaborative,
    isLock,
  } = review

  const collaborativeUsers = teams.find(t => t.role === 'collaborativeReviewer')

  const users = review.user
    ? [user]
    : collaborativeUsers?.members
        .filter(m => !['invited', 'rejected'].includes(m.status))
        .map(member => member.user) || []

  const recommendation = ensureJsonIsParsed(review.jsonData)?.$verdict

  const journal = useContext(JournalContext)

  const [open, setOpen] = useState(false)
  const toggleOpen = () => setOpen(!open)

  // just select the first user to find the status  of the review
  const [u] = users

  const userMember = teams.map(
    team => team.members.find(member => member.user.id === u?.id) || false,
  )

  const { status } = find(userMember || [], item => isObject(item)) || {}

  return (
    <Root>
      <ReviewHeading
        canBePublishedPublicly={canBePublishedPublicly}
        canHideReviews={canHideReviews}
        currentUser={currentUser}
        id={id}
        isCollaborative={isCollaborative}
        isControlPage={isControlPage}
        isHiddenFromAuthor={isHiddenFromAuthor}
        isHiddenReviewerName={isHiddenReviewerName}
        isLock={isLock}
        journal={journal}
        lockUnlockReview={lockUnlockReview}
        manuscriptId={manuscriptId}
        open={open}
        ordinal={ordinal}
        recommendation={recommendation}
        teams={teams}
        toggleOpen={toggleOpen}
        updateReview={updateReview}
        users={users}
      />
      <ReviewDetailsModal
        canEditReviews={canEditReviews}
        createFile={createFile}
        currentUser={currentUser}
        deleteFile={deleteFile}
        isControlPage={isControlPage}
        isOpen={open}
        manuscriptId={manuscriptId}
        onClose={toggleOpen}
        readOnly={readOnly}
        review={review}
        reviewerTeamMember={reviewerTeamMember}
        reviewForm={reviewForm}
        showEditorOnlyFields={showEditorOnlyFields}
        showUserInfo
        status={status}
        threadedDiscussionProps={threadedDiscussionProps}
        updateCollaborativeTeamMember={updateCollaborativeTeamMember}
        updateReview={updateReview}
        updateReviewJsonData={updateReviewJsonData}
        updateSharedStatusForInvitedReviewer={
          updateSharedStatusForInvitedReviewer
        }
        updateTeamMember={updateTeamMember}
      />
    </Root>
  )
}

DecisionReview.propTypes = {
  review: PropTypes.object,
  ordinal: PropTypes.number.isRequired,
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,
}

export default DecisionReview

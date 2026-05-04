/* eslint-disable react/prop-types */

import { useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { Action, MediumRow } from '../../../shared'
import { color } from '../../../../theme'
import { findReviewerStatus } from './reviewStatusUtils'

const Divider = styled.div`
  background-image: linear-gradient(${color.brand2.base}, ${color.brand2.base});
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 1px 100%;
`

const ReviewerItemLinks = ({
  manuscript,
  // urlFrag,
  reviewerRespond,
  currentUser,
  updateReviewerStatus,
  getMainActionLink,
}) => {
  const status = findReviewerStatus(manuscript, currentUser.id)

  const team = (manuscript.teams || []).find(t => {
    const member = t.members.find(m => m.user.id === currentUser.id)
    return (
      (t.role === 'reviewer' || t.role === 'collaborativeReviewer') && member
    )
  })

  const navigate = useNavigate()

  const mainActionLink = getMainActionLink && getMainActionLink(manuscript)
  const { t } = useTranslation()

  const reviewLinkText = {
    completed: t('common.View'),
    accepted: t('manuscriptsTable.reviewDo'),
    inProgress: t('manuscriptsTable.reviewContinue'),
    closed: t('common.View'),
  }

  if (['accepted', 'completed', 'inProgress', 'closed'].includes(status)) {
    return (
      <Action
        onClick={async e => {
          e.stopPropagation()
          // on click, update review status before forwarding to link

          if (status === 'accepted') {
            await updateReviewerStatus({
              variables: {
                manuscriptId: manuscript.id,
                status: 'inProgress',
              },
            })
          }

          navigate(mainActionLink)
        }}
      >
        {reviewLinkText[status]}
      </Action>
    )
  }

  if (status === 'invited') {
    return (
      <MediumRow>
        <Action
          data-testid="accept-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'accepted',
                teamId: team.id,
              },
            })
          }}
        >
          {t('manuscriptsTable.reviewAccept')}
        </Action>
        <Divider>&nbsp;</Divider>
        <Action
          data-testid="reject-review"
          onClick={e => {
            e.stopPropagation()
            reviewerRespond({
              variables: {
                currentUserId: currentUser.id,
                action: 'rejected',
                teamId: team.id,
              },
            })
          }}
        >
          {t('manuscriptsTable.reviewReject')}
        </Action>
      </MediumRow>
    )
  }

  return null
}

export default ReviewerItemLinks
